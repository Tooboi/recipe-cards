import { UserProfile } from "@clerk/nextjs";

export default function page() {
  return (
    <div className="flex items-center justify-center mt-8">
      <UserProfile />
    </div>
  );
}