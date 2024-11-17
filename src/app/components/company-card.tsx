"use client";

import type { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface CompanyCardProps {
	company: Company;
	isPresentationMode: boolean;
	onDelete: (id: string) => void;
	onDragStart: (e: React.DragEvent, company: Company) => void;
	onDragEnd: () => void;
	onNameEdit: (
		e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
		id: string,
	) => void;
	editingCompanyId: string | null;
	onNameChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
	onFinishEditing: () => void;
}

const LOGO_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || "";

export function CompanyCard({
	company,
	isPresentationMode,
	onDelete,
	onDragStart,
	onDragEnd,
	onNameEdit,
	editingCompanyId,
	onNameChange,
	onFinishEditing,
}: CompanyCardProps) {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onNameEdit(e, company.id);
		}
	};

	return (
		<div
			className="relative cursor-move"
			draggable={!isPresentationMode}
			onDragStart={(e) => onDragStart(e, company)}
			onDragEnd={onDragEnd}
		>
			<div className="relative w-16 h-16 mx-auto">
				<Image
					unoptimized
					src={`https://img.logo.dev/${company.url}?token=${LOGO_TOKEN}`}
					alt={`${company.name} logo`}
					width={64}
					height={64}
					className="w-full h-full object-contain bg-gray-800 rounded-md"
				/>
				<Button
					variant="ghost"
					size="icon"
					className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 rounded-full p-0.5 w-4 h-4"
					onClick={() => onDelete(company.id)}
				>
					<X className="h-2 w-2" />
					<span className="sr-only">Delete {company.name}</span>
				</Button>
			</div>
			<div
				role="button"
				tabIndex={0}
				className="mt-2 text-sm text-center text-gray-300 cursor-text"
				onClick={(e) => onNameEdit(e, company.id)}
				onKeyDown={handleKeyDown}
			>
				{editingCompanyId === company.id ? (
					<Input
						type="text"
						value={company.name}
						onChange={(e) => onNameChange(e, company.id)}
						onBlur={onFinishEditing}
						className="bg-gray-700 text-white px-2 py-1 rounded text-center w-full"
						onClick={(e) => e.stopPropagation()}
						autoFocus
					/>
				) : (
					company.name
				)}
			</div>
		</div>
	);
}
