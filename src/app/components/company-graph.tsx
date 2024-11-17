"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyCard } from "./company-card";
import { useReward } from "react-rewards";
import Image from "next/image";

type Company = {
	id: string;
	name: string;
	url: string;
	x: number;
	y: number;
	isRevealed?: boolean;
};

type AxisLabel = {
	id: string;
	text: string;
};

type EditEvent =
	| React.MouseEvent<HTMLDivElement>
	| React.KeyboardEvent<HTMLDivElement>;

export default function CompanyGraph() {
	const [companies, setCompanies] = useState<Company[]>([]);
	const [newCompany, setNewCompany] = useState("");
	const [draggingCompany, setDraggingCompany] = useState<Company | null>(null);
	const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
	const [isPresentationMode, setIsPresentationMode] = useState(false);
	const [axisLabels, setAxisLabels] = useState<AxisLabel[]>([
		{ id: "left", text: "Low Impact" },
		{ id: "right", text: "High Impact" },
		{ id: "top", text: "High Effort" },
		{ id: "bottom", text: "Low Effort" },
	]);
	const [editingLabel, setEditingLabel] = useState<string | null>(null);
	const [isLeftPaneCollapsed, setIsLeftPaneCollapsed] = useState(false);
	const graphRef = useRef<HTMLDivElement>(null);
	const editInputRef = useRef<HTMLInputElement>(null);
	const { reward: triggerConfetti, isAnimating: isConfettiAnimating } =
		useReward("confettiReward", "confetti", {
			lifetime: 50,
			spread: 33,
			startVelocity: 20,
			elementCount: 16,
			elementSize: 8,
			zIndex: 10,
			decay: 0.9,
			colors: ["#FFFFFF", "#E5E5E5"],
		});

	const formatCompanyName = (urlString: string) => {
		try {
			const url = new URL(
				urlString.startsWith("http") ? urlString : `http://${urlString}`,
			);
			return url.hostname
				.split(".")
				.slice(0, -1)
				.join(" ")
				.split("-")
				.map(
					(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
				)
				.join(" ");
		} catch {
			return (
				urlString.charAt(0).toUpperCase() + urlString.slice(1).toLowerCase()
			);
		}
	};

	const addCompany = (e: React.FormEvent) => {
		e.preventDefault();
		if (newCompany) {
			const id = Math.random().toString(36).substr(2, 9);
			const formattedName = formatCompanyName(newCompany);
			setCompanies([
				...companies,
				{ id, name: formattedName, url: newCompany, x: -1000, y: -1000 },
			]);
			setNewCompany("");
		}
	};

	const deleteCompany = (id: string) => {
		setCompanies(companies.filter((company) => company.id !== id));
	};

	const onDragStart = (e: React.DragEvent, company: Company) => {
		if (isPresentationMode) {
			e.preventDefault();
			return;
		}
		setDraggingCompany(company);
		// @ts-expect-error - Image constructor is not fully typed in React DnD context
		const img = new Image();
		img.src =
			"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
		e.dataTransfer.setDragImage(img, 0, 0);
	};

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (draggingCompany && graphRef.current && !isPresentationMode) {
			const rect = graphRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			setCompanies((prevCompanies) =>
				prevCompanies.map((c) =>
					c.id === draggingCompany.id ? { ...c, x, y } : c,
				),
			);
		}
	};

	const onDragEnd = () => {
		setDraggingCompany(null);
	};

	const startEditing = (e: EditEvent, id: string) => {
		e.stopPropagation();
		setEditingLabel(id);
	};

	const startEditingCompany = (e: EditEvent, id: string) => {
		if (isPresentationMode) return;
		e.stopPropagation();
		setEditingCompanyId(id);
	};

	const handleLabelChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		id: string,
	) => {
		setAxisLabels((prevLabels) =>
			prevLabels.map((label) =>
				label.id === id ? { ...label, text: e.target.value } : label,
			),
		);
	};

	const handleCompanyNameChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		id: string,
	) => {
		setCompanies((prevCompanies) =>
			prevCompanies.map((company) =>
				company.id === id ? { ...company, name: e.target.value } : company,
			),
		);
	};

	const finishEditing = () => {
		setEditingLabel(null);
		setEditingCompanyId(null);
	};

	const togglePresentationMode = () => {
		setIsPresentationMode(!isPresentationMode);
		if (!isPresentationMode) {
			setCompanies(
				companies.map((company) => ({ ...company, isRevealed: false })),
			);
		}
	};

	const revealCompany = (id: string, e: React.MouseEvent) => {
		if (isPresentationMode && !isConfettiAnimating) {
			const rect = graphRef.current?.getBoundingClientRect();
			if (rect) {
				void triggerConfetti();

				const rewardElement = document.getElementById("confettiReward");
				if (rewardElement) {
					rewardElement.style.left = `${e.clientX - rect.left}px`;
					rewardElement.style.top = `${e.clientY - rect.top}px`;
					rewardElement.style.transform = "translate(-50%, -50%)";
				}
			}

			setCompanies(
				companies.map((company) =>
					company.id === id ? { ...company, isRevealed: true } : company,
				),
			);
		}
	};

	useEffect(() => {
		const handleMouseUp = () => {
			setDraggingCompany(null);
		};
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	useEffect(() => {
		if (editingLabel && editInputRef.current) {
			editInputRef.current.focus();
		}
	}, [editingLabel]);

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLDivElement>,
		action: () => void,
	) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			action();
		}
	};

	return (
		<div className="flex h-screen bg-gray-900 text-white">
			{/* Left Pane */}
			<div
				className={`${isLeftPaneCollapsed ? "w-12" : "w-1/3"} transition-all duration-300 ease-in-out border-r border-gray-700 flex flex-col`}
			>
				<div className="flex justify-end gap-2 m-2">
					<Button
						variant="ghost"
						size="icon"
						className={`${isPresentationMode ? "bg-blue-600 hover:bg-blue-700" : ""}`}
						onClick={togglePresentationMode}
					>
						<Presentation className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsLeftPaneCollapsed(!isLeftPaneCollapsed)}
					>
						{isLeftPaneCollapsed ? <ChevronRight /> : <ChevronLeft />}
					</Button>
				</div>
				{!isLeftPaneCollapsed && (
					<div className="p-6 flex-grow overflow-auto">
						<form onSubmit={addCompany} className="mb-6">
							<Label htmlFor="company-name" className="text-gray-300">
								Company Name or URL
							</Label>
							<div className="flex mt-2">
								<Input
									id="company-name"
									value={newCompany}
									onChange={(e) => setNewCompany(e.target.value)}
									placeholder="Enter company name or URL"
									className="flex-grow bg-gray-800 text-white border-gray-700"
								/>
								<Button
									type="submit"
									className="ml-2 bg-blue-600 hover:bg-blue-700"
								>
									<Plus className="h-4 w-4" />
									<span className="sr-only">Add company</span>
								</Button>
							</div>
						</form>
						<div className="grid grid-cols-3 gap-4">
							{companies.map((company) => (
								<CompanyCard
									key={company.id}
									company={company}
									isPresentationMode={isPresentationMode}
									onDelete={deleteCompany}
									onDragStart={onDragStart}
									onDragEnd={onDragEnd}
									onNameEdit={startEditingCompany}
									editingCompanyId={editingCompanyId}
									onNameChange={handleCompanyNameChange}
									onFinishEditing={finishEditing}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Right Pane */}
			<div className="flex-grow p-6 relative flex flex-col">
				<div
					ref={graphRef}
					className="w-full flex-grow border border-gray-700 rounded-lg bg-gray-800 relative overflow-hidden"
					onDragOver={onDragOver}
				>
					{/* Grid Background */}
					<div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
						{Array.from({ length: 16 }).map((_, i) => (
							<div
								key={`grid-cell-${Math.floor(i / 4)}-${i % 4}`}
								className="border border-gray-700 opacity-20"
							/>
						))}
					</div>
					<span
						id="confettiReward"
						className="absolute w-4 h-4 transition-all duration-300"
						style={{ pointerEvents: "none" }}
					/>

					{/* Axes */}
					<div className="absolute inset-0">
						{/* Horizontal axis */}
						<div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-600" />
						<div className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer">
							<button
								type="button"
								onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
									startEditing(e as unknown as EditEvent, "left")
								}
								onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) =>
									handleKeyDown(
										e as unknown as React.KeyboardEvent<HTMLDivElement>,
										() => startEditing(e as unknown as EditEvent, "left"),
									)
								}
								className="text-gray-300 text-base font-semibold bg-transparent border-none w-full text-left"
							>
								{editingLabel === "left" ? (
									<input
										ref={editInputRef}
										type="text"
										value={axisLabels.find((l) => l.id === "left")?.text}
										onChange={(e) => handleLabelChange(e, "left")}
										onBlur={finishEditing}
										className="bg-gray-700 text-white px-2 py-1 rounded"
									/>
								) : (
									axisLabels.find((l) => l.id === "left")?.text
								)}
							</button>
						</div>
						<div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
							<button
								type="button"
								onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
									startEditing(e as unknown as EditEvent, "right")
								}
								onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) =>
									handleKeyDown(
										e as unknown as React.KeyboardEvent<HTMLDivElement>,
										() => startEditing(e as unknown as EditEvent, "right"),
									)
								}
								className="text-gray-300 text-base font-semibold bg-transparent border-none w-full text-left"
							>
								{editingLabel === "right" ? (
									<input
										ref={editInputRef}
										type="text"
										value={axisLabels.find((l) => l.id === "right")?.text}
										onChange={(e) => handleLabelChange(e, "right")}
										onBlur={finishEditing}
										className="bg-gray-700 text-white px-2 py-1 rounded"
									/>
								) : (
									axisLabels.find((l) => l.id === "right")?.text
								)}
							</button>
						</div>

						{/* Vertical axis */}
						<div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-600" />
						<div className="absolute top-4 left-1/2 -translate-x-1/2 cursor-pointer">
							<button
								type="button"
								onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
									startEditing(e as unknown as EditEvent, "top")
								}
								onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) =>
									handleKeyDown(
										e as unknown as React.KeyboardEvent<HTMLDivElement>,
										() => startEditing(e as unknown as EditEvent, "top"),
									)
								}
								className="text-gray-300 text-base font-semibold bg-transparent border-none w-full text-left"
							>
								{editingLabel === "top" ? (
									<input
										ref={editInputRef}
										type="text"
										value={axisLabels.find((l) => l.id === "top")?.text}
										onChange={(e) => handleLabelChange(e, "top")}
										onBlur={finishEditing}
										className="bg-gray-700 text-white px-2 py-1 rounded"
									/>
								) : (
									axisLabels.find((l) => l.id === "top")?.text
								)}
							</button>
						</div>
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer">
							<button
								type="button"
								onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
									startEditing(e as unknown as EditEvent, "bottom")
								}
								onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) =>
									handleKeyDown(
										e as unknown as React.KeyboardEvent<HTMLDivElement>,
										() => startEditing(e as unknown as EditEvent, "bottom"),
									)
								}
								className="text-gray-300 text-base font-semibold bg-transparent border-none w-full text-left"
							>
								{editingLabel === "bottom" ? (
									<input
										ref={editInputRef}
										type="text"
										value={axisLabels.find((l) => l.id === "bottom")?.text}
										onChange={(e) => handleLabelChange(e, "bottom")}
										onBlur={finishEditing}
										className="bg-gray-700 text-white px-2 py-1 rounded"
									/>
								) : (
									axisLabels.find((l) => l.id === "bottom")?.text
								)}
							</button>
						</div>
					</div>

					{/* Companies */}
					{companies.map((company) => (
						<div
							key={company.id}
							style={{
								position: "absolute",
								left: `${company.x}px`,
								top: `${company.y}px`,
								transform: "translate(-50%, -50%)",
								cursor: isPresentationMode ? "pointer" : "move",
								transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
							}}
							draggable={!isPresentationMode}
							onDragStart={(e) => onDragStart(e, company)}
							onDragEnd={onDragEnd}
							onClick={(e) => revealCompany(company.id, e)}
							onKeyDown={(e) =>
								handleKeyDown(e, () =>
									revealCompany(company.id, e as unknown as React.MouseEvent),
								)
							}
							role="button"
							tabIndex={0}
						>
							<div className="flex flex-col items-center">
								<div
									className={`relative w-12 h-12 ${
										isPresentationMode && !company.isRevealed
											? "bg-gray-600"
											: ""
									} rounded-md shadow-lg transition-all duration-500`}
								>
									<Image
										unoptimized
										src={`https://img.logo.dev/${company.url}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN}`}
										alt={`${company.name} logo`}
										width={48}
										height={48}
										className={`object-contain rounded-md ${
											isPresentationMode && !company.isRevealed
												? "opacity-0"
												: "opacity-100"
										} transition-opacity duration-500`}
									/>
								</div>
								{(!isPresentationMode || company.isRevealed) && (
									<div
										className="mt-2 text-sm text-center text-gray-300 cursor-text bg-gray-800 px-2 py-1 rounded"
										onClick={(e) =>
											startEditingCompany(e as EditEvent, company.id)
										}
										onKeyDown={(e) =>
											handleKeyDown(e, () =>
												startEditingCompany(e as EditEvent, company.id),
											)
										}
										role="button"
										tabIndex={0}
									>
										{editingCompanyId === company.id ? (
											<input
												type="text"
												value={company.name}
												onChange={(e) => handleCompanyNameChange(e, company.id)}
												onBlur={finishEditing}
												className="bg-gray-700 text-white px-2 py-1 rounded text-center w-full"
												onClick={(e) => e.stopPropagation()}
											/>
										) : (
											company.name
										)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
				<div className="text-center text-gray-400 text-sm mt-2">
					<a
						href="https://logo.dev"
						className="hover:text-blue-400 transition-colors"
						target="_blank"
						rel="noopener noreferrer"
					>
						Logos provided by Logo.dev
					</a>
				</div>
			</div>
		</div>
	);
}
