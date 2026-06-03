/* ============================================================
   短信发送（可插拔）
   - 配了阿里云密钥 → 真发（阿里云 Dysmsapi SendSms，RPC 签名 v1）
   - 否则开发模式：只在服务端日志打印验证码，返回成功
   ============================================================ */

export function smsEnabled() {
  return Boolean(
    process.env.SMS_PROVIDER === "aliyun" &&
      process.env.SMS_ACCESS_KEY_ID &&
      process.env.SMS_ACCESS_KEY_SECRET &&
      process.env.SMS_SIGN_NAME &&
      process.env.SMS_TEMPLATE_CODE
  );
}

export type SmsResult = { ok: boolean; reason?: string };

export async function sendSms(phone: string, code: string): Promise<SmsResult> {
  if (!smsEnabled()) {
    console.log(`[小满 DEV OTP] ${phone}: ${code}`);
    return { ok: true };
  }
  try {
    return await sendAliyun(phone, code);
  } catch (err) {
    console.error("[SMS] send failed", err);
    return { ok: false, reason: "请求异常" };
  }
}

/* ---------- 阿里云 Dysmsapi（RPC 风格，HMAC-SHA1 签名） ---------- */

function percentEncode(s: string) {
  return encodeURIComponent(s)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

async function hmacSha1Base64(key: string, data: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return typeof Buffer === "undefined" ? btoa(binary) : Buffer.from(bytes).toString("base64");
}

async function sendAliyun(phone: string, code: string): Promise<SmsResult> {
  const accessKeyId = process.env.SMS_ACCESS_KEY_ID as string;
  const accessKeySecret = process.env.SMS_ACCESS_KEY_SECRET as string;
  const signName = process.env.SMS_SIGN_NAME as string;
  const templateCode = process.env.SMS_TEMPLATE_CODE as string;

  const params: Record<string, string> = {
    AccessKeyId: accessKeyId,
    Action: "SendSms",
    Format: "JSON",
    PhoneNumbers: phone,
    RegionId: "cn-hangzhou",
    SignName: signName,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    TemplateCode: templateCode,
    TemplateParam: JSON.stringify({ code }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: "2017-05-25"
  };

  const sortedQuery = Object.keys(params)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`)
    .join("&");
  const stringToSign = `POST&${percentEncode("/")}&${percentEncode(sortedQuery)}`;
  const signature = await hmacSha1Base64(`${accessKeySecret}&`, stringToSign);

  const body = `Signature=${percentEncode(signature)}&${sortedQuery}`;
  const res = await fetch("https://dysmsapi.aliyuncs.com/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = (await res.json().catch(() => ({}))) as { Code?: string; Message?: string };
  if (data.Code !== "OK") {
    console.error("[SMS] aliyun:", data.Code, data.Message);
    return { ok: false, reason: `${data.Code ?? "未知"}｜${data.Message ?? ""}`.trim() };
  }
  return { ok: true };
}
