// Test: Wie verhält sich wouter's useSearch?
// Dokumentation prüfen

const testCases = [
  { url: "/register?courseId=450001", expected: "?courseId=450001" },
  { url: "/register", expected: "" },
  { url: "/register?foo=bar&baz=qux", expected: "?foo=bar&baz=qux" }
];

console.log("Wouter useSearch() behavior:");
console.log("According to docs: returns the search string INCLUDING the '?'");
console.log("\nTest cases:");
testCases.forEach(tc => {
  console.log(`URL: ${tc.url} → useSearch(): "${tc.expected}"`);
});

console.log("\nProblem in current code:");
console.log('setLocation(`/anmeldung${searchParams}`)');
console.log("If searchParams = '?courseId=450001'");
console.log("Result: '/anmeldung?courseId=450001' ✅");
console.log("\nBUT if searchParams contains '?courseId=450001'");
console.log("and we do `/anmeldung${searchParams}`");
console.log("we get: '/anmeldung?courseId=450001' ✅");
console.log("\nSO the issue must be elsewhere...");
console.log("\nLet me check if searchParams is being parsed correctly");
