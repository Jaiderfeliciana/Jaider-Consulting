import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="login">
      <div className="login-card">
        <div className="login-brand"><Logo id="jf-logo-login" /> <span>Jaider Feliciana</span></div>
        <h1>Admin panel</h1>
        <p>Log in to see your bookings, clients, earnings and visitors.</p>
        <LoginForm />
      </div>
    </main>
  );
}
