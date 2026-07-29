import FeatureCard from "./feature-card";

// 首頁功能按鈕群組（目前僅「開始占卜」一項）
const features = [
  {
    href: "/reading",
    label: "開始占卜",
    className:
      "w-full max-w-xs rounded-2xl border border-primary/30 bg-primary px-6 py-4 text-center text-lg font-semibold text-white",
  },
];

export default function FeatureGrid() {
  return (
    <>
      {features.map((feature) => (
        <FeatureCard key={feature.href} {...feature} />
      ))}
    </>
  );
}
