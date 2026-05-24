"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const discounts = [
  { id: "none", label: "No discount", detail: "Standard fee" },
  { id: "army", label: "Army family", detail: "Verified discount" },
  { id: "disabled", label: "Disabled student", detail: "Verified discount" },
  { id: "single_parent", label: "Single parent", detail: "Flat support fee" },
];

export default function DiscountSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-2">
      {discounts.map((discount) => (
        <label
          key={discount.id}
          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${
            value === discount.id ? "border-[#5c35d9] bg-purple-50" : "border-gray-200 bg-white"
          }`}
        >
          <span>
            <span className="block font-semibold text-gray-900">{discount.label}</span>
            <span className="text-xs text-gray-500">{discount.detail}</span>
          </span>
          <input
            type="radio"
            name="discount"
            value={discount.id}
            checked={value === discount.id}
            onChange={(e) => onChange(e.target.value)}
            className="accent-[#5c35d9]"
          />
        </label>
      ))}
    </div>
  );
}
