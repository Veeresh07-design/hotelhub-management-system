
function DashboardCard({ title, value, icon, color = "gold" }) {
  const iconColors = {
    gold: "bg-[#F4F0E7] text-[#9B7A43]",
    green: "bg-[#E9F6EE] text-green-700",
    red: "bg-[#FCECEC] text-[#A94442]",
    blue: "bg-[#EEF2F8] text-[#42658B]",
  };

  return (
    <div className="premium-card p-6 hover:-translate-y-1 transition duration-200">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-[#172B36] mt-4">
            {value}
          </h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${iconColors[color] || iconColors.gold}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1 w-12 rounded-full bg-[#C5A46D]" />
    </div>
  );
}

export default DashboardCard;
