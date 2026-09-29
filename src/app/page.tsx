import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // logged-out users get bounced to /login by the proxy
}