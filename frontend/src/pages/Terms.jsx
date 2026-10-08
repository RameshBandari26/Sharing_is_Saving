const S = [
  [
    "1. About ShareRide",
    "ShareRide is a community platform that lets people who are already travelling share empty seats with others heading the same way. ShareRide is not a taxi, cab or transport service, and hosts are not professional drivers.",
  ],
  [
    "2. Eligibility & accounts",
    "You must be at least 18 years old and hold a valid driving licence to host a journey. You are responsible for keeping your account details accurate and your login secure.",
  ],
  [
    "3. Hosts",
    "Hosts must publish accurate route, timing, vehicle and seat information, hold valid insurance and registration, drive safely, and follow all traffic laws. Starting a journey notifies joined passengers and enables vehicle tracking.",
  ],
  [
    "4. Passengers",
    "Passengers must join only journeys they intend to take, be ready at the pickup point on time, respect the host's vehicle and rules, and cancel early if plans change.",
  ],
  [
    "5. Sharing contribution",
    "The sharing contribution is a cost-sharing amount towards fuel and tolls for a journey that is already happening. Hosts must not use ShareRide to earn commercial profit.",
  ],
  [
    "6. Live tracking & privacy",
    "When a host starts a journey, the vehicle's location is visible only to the host and joined passengers for the duration of that journey. We handle personal data according to our privacy practices and never sell it.",
  ],
  [
    "7. Safety & conduct",
    "Be respectful. Harassment, discrimination, unsafe driving, or illegal activity is prohibited and may lead to removal. Share journey details with someone you trust.",
  ],
  [
    "8. Cancellations",
    "Hosts and passengers should cancel as early as possible. Repeated last-minute cancellations may affect ratings and account standing.",
  ],
  [
    "9. Ratings & reviews",
    "Reviews must be honest and based on a real journey. We may remove content that is abusive, false or off-topic.",
  ],
  [
    "10. Liability",
    "ShareRide connects members and does not control journeys. To the extent permitted by law, ShareRide is not liable for loss, injury or damage arising from journeys arranged through the platform. Members travel at their own responsibility.",
  ],
  [
    "11. Changes & contact",
    "We may update these terms from time to time; continued use means you accept the changes. Questions? Write to support@shareride.example.",
  ],
];
export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-extrabold">Terms &amp; Conditions</h1>
        <p className="text-sm text-neutral-500">Last updated: October 2026</p>
      </div>
      {S.map(([t, b]) => (
        <section key={t}>
          <h2 className="mb-1 text-lg font-bold">{t}</h2>
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {b}
          </p>
        </section>
      ))}
    </div>
  );
}
