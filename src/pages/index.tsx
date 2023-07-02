import React, { useState } from "react";

export default function Home() {
  const [value, setValue] = useState(0);
  const [result, setResult] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseFloat(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(value * 2);
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-400 to-blue-500 text-white">
      <h1 className="text-4xl font-bold mb-8">Rat Medicine Dosage Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded shadow-lg text-black">
        <div className="flex flex-col space-y-2">
          <label htmlFor="value" className="text-lg font-medium">
            Enter dosage:
          </label>
          <input
            id="value"
            type="number"
            value={value}
            onChange={handleChange}
            className="px-2 py-1 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-200">
          Calculate
        </button>
      </form>
      {result !== 0 && (
        <div className="mt-8 bg-white p-4 rounded shadow-lg text-black">
          <h2 className="text-2xl font-medium">Result: {result}</h2>
        </div>
      )}
    </main>
  );
}
