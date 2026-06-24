export const metadata = { title: "Terms of Service" };

export default function Page() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <h2>Acceptance</h2>
      <p>By creating an account you agree to these terms and to our Privacy Policy and Medical Disclaimer.</p>
      <h2>Eligibility</h2>
      <p>
        You must be at least 13 years old (and have guardian consent if under 18) to use FitTrack.
        The app is intended for general wellness, not for treating any medical condition.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Provide accurate information, keep your password secure, and do not misuse, scrape, or attempt
        to break the service. We may suspend accounts that violate these terms.
      </p>
      <h2>No warranty</h2>
      <p>
        FitTrack is provided "as is" without warranties. Plans are estimates — see the Medical
        Disclaimer. We may change or discontinue features at any time.
      </p>
      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by law, FitTrack is not liable for any damages arising from use of the service.</p>
    </>
  );
}
