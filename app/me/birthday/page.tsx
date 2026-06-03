import { redirect } from "next/navigation";
import { BirthdayForm } from "@/components/birthday-form";
import { getCurrentUser } from "@/lib/auth";

export default async function MeBirthdayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <BirthdayForm initialBirthday={user.birthday} initialType={user.birthday_type ?? "solar"} />;
}
