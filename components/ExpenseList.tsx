export default function ExpenseList({ expenses }: { expenses: any[] }) {
  return (
    <div className="space-y-3 mt-4">
      {expenses.map((exp) => (
        <div key={exp.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
          <div>
            <p className="font-semibold">{exp.description}</p>
            <p>${exp.amount}</p>
            <p className={`text-sm ${exp.status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
              {exp.status.toUpperCase()}
            </p>
            {exp.receipt_url && (
              <a
                href={exp.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm"
              >
                View Receipt
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
