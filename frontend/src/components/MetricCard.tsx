interface Props {
  title: string;
  value: string | number;
}

export default function MetricCard({ title, value }: Props) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
