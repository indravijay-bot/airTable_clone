import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { SignIn } from "./_components/sign-in";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#3b82f6] to-[#6366f1] text-white">
       <SignIn />
      </main>
    </HydrateClient>
  );
}
