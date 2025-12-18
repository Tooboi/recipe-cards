import { UserProfile } from "@clerk/nextjs";

const page = () => {
  return (
    <div className="flex items-center justify-center mt-8">
      <UserProfile />
    </div>
  );
};

export default page;