export function ErrorList({ list }) {
  const messages = Array.isArray(list) ? list.filter(Boolean) : [];

  if (messages.length === 0) {
    return null;
  }

  return (
    <ul className="errorList" role="alert">
      {messages.map((error, index) => (
        <li key={`${error}-${index}`}>{error}</li>
      ))}
    </ul>
  );
}