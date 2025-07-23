import dynamic from "next/dynamic";

const GradientGenerator = dynamic(
  () => import("./GradientGenerator"),
  { ssr: false } // This will make sure GradientGenerator is only rendered on the client side
);

export default function Page() {
  return <GradientGenerator />;
}
