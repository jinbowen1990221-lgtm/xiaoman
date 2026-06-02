export type BirthdayType = "solar" | "lunar";
export type Lifestyle = "working" | "freelance" | "studying" | "uncertain";
export type PreferredLottery = "double_color" | "super_lotto" | "arrangement_3";

export type User = {
  id: string;
  phone: string;
  nickname: string | null;
  birthday: string | null;
  birthday_type: BirthdayType;
  lifestyle: Lifestyle | null;
  initial_thought: string | null;
  remind_time: string | null;
  remind_enabled: boolean;
  onboarding_completed: boolean;
  onboarding_step?: string;
  preferred_lottery: PreferredLottery;
  created_at: string;
  updated_at: string;
};

export type Record = {
  id: string;
  content: string;
  createdAt: string;
};

export type StoredRecord = {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  input_type: "text" | "voice";
  audio_duration: number | null;
  mood: string | null;
  created_at: string;
};

export type StoredNote = {
  id: string;
  user_id: string;
  choice: string;
  text: string;
  possibility: number;
  created_at: string;
};

export type PredictionStatus = "pending" | "hit" | "partial" | "miss";

export type StoredPrediction = {
  id: string;
  user_id: string;
  content: string; // the falsifiable prediction
  basis: string; // grounded reason ("据你说的…")
  status: PredictionStatus;
  created_at: string;
  verified_at: string | null;
};

export type CoinFlip = {
  id: string;
  user_id: string;
  option_a: string;
  option_b: string;
  result: "a" | "b";
  bob_comment: string | null;
  followed: boolean | null;
  created_at: string;
};

export type OnboardingPatch = Partial<
  Pick<
    User,
    | "nickname"
    | "birthday"
    | "birthday_type"
    | "lifestyle"
    | "initial_thought"
    | "remind_time"
    | "remind_enabled"
    | "onboarding_completed"
    | "preferred_lottery"
  >
>;
