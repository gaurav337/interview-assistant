import { requireAuth } from "@/lib/getCurrentUser";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name ?? user.email}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </main>
  );
}
