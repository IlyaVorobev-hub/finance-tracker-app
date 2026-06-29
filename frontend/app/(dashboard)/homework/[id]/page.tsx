import HomeworkDetailClient from "./HomeworkDetailClient";

export default async function HomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HomeworkDetailClient id={id} />;
}
