import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoreForm } from "@/components/admin/store-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditarLojaPage({ params }: Props) {
  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar {store.name}</h1>
      <StoreForm store={store} />
    </div>
  );
}
