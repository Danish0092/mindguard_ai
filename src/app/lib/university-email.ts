
export type StudentEmailDetails = {
  email: string;
  campus: "Lahore";
  batch: string;
  program: string;
  rollNumber: string;
};

export function parseStudentUniversityEmail(
  input: string
): StudentEmailDetails | null {
  const email = input.trim().toLowerCase();

  const match = email.match(
    /^([a-z]{2}\d{2})-([a-z]{2,5})-(\d{3})@cuilahore\.edu\.pk$/
  );

  if (!match) return null;

  const [, batch, program, rollNumber] = match;

  return {
    email,
    campus: "Lahore",
    batch: batch.toUpperCase(),
    program: program.toUpperCase(),
    rollNumber,
  };
}
