export const metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <p>
        This policy explains what data FitTrack collects and how it is used. By using the app you
        consent to this policy.
      </p>
      <h2>What we collect</h2>
      <p>
        Account details (name, email), the answers you give during onboarding (including any health
        conditions you choose to declare), and the data you log: meals, water, weight, workouts, and
        optional progress photos.
      </p>
      <h2>How we use it</h2>
      <p>
        Solely to generate and run your personalized plan, show your progress, and operate the app.
        We do not sell your personal data.
      </p>
      <h2>Storage & security</h2>
      <p>
        Data is stored in Supabase (Postgres) with Row Level Security so that you can only access
        your own records. Progress photos are kept in a private storage bucket.
      </p>
      <h2>Your rights</h2>
      <p>
        You can export your data (CSV) and permanently delete your account at any time from Settings.
        Deleting your account removes your profile and logs.
      </p>
      <h2>Cookies</h2>
      <p>We use essential cookies for authentication only.</p>
      <h2>Contact</h2>
      <p>For privacy questions, contact the site owner.</p>
    </>
  );
}
