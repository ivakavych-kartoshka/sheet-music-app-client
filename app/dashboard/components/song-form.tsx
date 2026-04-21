"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import {
	createSong,
	getSongById,
	type CreateSongInput,
	type CreateSongSectionInput,
	normalizeSong,
	updateSong,
	uploadAudioFile,
} from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SongLineForm = {
	lyric: string;
	notes: string;
};

type SongSectionForm = {
	title: string;
	lines: SongLineForm[];
};

type SongFormProps = {
	mode: "create" | "edit";
	songId?: string;
	onSaved?: () => void;
};

function createEmptyLine(): SongLineForm {
	return { lyric: "", notes: "" };
}

function createEmptySection(): SongSectionForm {
	return { title: "", lines: [createEmptyLine()] };
}

export function SongForm({ mode, songId, onSaved }: SongFormProps) {
	const isEditMode = mode === "edit";
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [audioUrl, setAudioUrl] = useState("");
	const [rawInput, setRawInput] = useState("");
	const [sections, setSections] = useState<SongSectionForm[]>([
		createEmptySection(),
	]);
	const [loadingSong, setLoadingSong] = useState(isEditMode);
	const [uploadingAudio, setUploadingAudio] = useState(false);
	const [normalizing, setNormalizing] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const resetForm = () => {
		setTitle("");
		setCategory("");
		setAudioUrl("");
		setRawInput("");
		setSections([createEmptySection()]);
	};

	const applyNormalizedPayload = (payload: CreateSongInput) => {
		setTitle(payload.title?.trim() || "");
		setCategory(payload.category?.trim() || "");
		setAudioUrl(payload.audioUrl?.trim() || "");
		setSections(
			payload.sections && payload.sections.length > 0
				? payload.sections.map((section) => ({
						title: section.title?.trim() || "",
						lines:
							section.lines && section.lines.length > 0
								? section.lines.map((line) => ({
										lyric: line.lyric || " ",
										notes: line.notes || " ",
									}))
								: [createEmptyLine()],
				  }))
				: [createEmptySection()],
		);
	};

	useEffect(() => {
		if (!isEditMode || !songId) {
			return;
		}

		let mounted = true;

		const fetchSong = async () => {
			try {
				setError(null);
				setLoadingSong(true);
				const song = await getSongById(songId);

				if (!mounted) {
					return;
				}

				setTitle(song.title?.trim() || "");
				setCategory(song.category?.trim() || "");
				setAudioUrl(song.audioUrl?.trim() || "");
				setSections(
					song.sections && song.sections.length > 0
						? song.sections.map((section) => ({
								title: section.title?.trim() || "",
								lines:
									section.lines && section.lines.length > 0
										? section.lines.map((line) => ({
												lyric: line.lyric?.trim() || "",
												notes: line.notes?.trim() || "",
											}))
										: [createEmptyLine()],
							}))
						: [createEmptySection()],
				);
			} catch {
				if (mounted) {
					setError("Khong the tai bai hat de chinh sua.");
				}
			} finally {
				if (mounted) {
					setLoadingSong(false);
				}
			}
		};

		void fetchSong();

		return () => {
			mounted = false;
		};
	}, [isEditMode, songId]);

	const handleUploadAudio = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFile = event.target.files?.[0];

		if (!selectedFile) {
			return;
		}

		const isMp3 =
			selectedFile.type === "audio/mpeg" ||
			selectedFile.name.toLowerCase().endsWith(".mp3");

		if (!isMp3) {
			setError("Chi ho tro file mp3.");
			event.target.value = "";
			return;
		}

		try {
			setError(null);
			setMessage(null);
			setUploadingAudio(true);

			const result = await uploadAudioFile(selectedFile);

			if (!result.audioUrl) {
				throw new Error("Upload failed");
			}

			setAudioUrl(result.audioUrl);
			setMessage("Upload audio thanh cong.");
		} catch {
			setError("Upload audio that bai. Kiem tra backend Cloudinary env va thu lai.");
		} finally {
			setUploadingAudio(false);
			event.target.value = "";
		}
	};

	const addSection = () => {
		setSections((prev) => [...prev, createEmptySection()]);
	};

	const removeSection = (sectionIndex: number) => {
		setSections((prev) => prev.filter((_, index) => index !== sectionIndex));
	};

	const updateSectionTitle = (sectionIndex: number, value: string) => {
		setSections((prev) =>
			prev.map((section, index) =>
				index === sectionIndex ? { ...section, title: value } : section,
			),
		);
	};

	const addLine = (sectionIndex: number) => {
		setSections((prev) =>
			prev.map((section, index) =>
				index === sectionIndex
					? { ...section, lines: [...section.lines, createEmptyLine()] }
					: section,
			),
		);
	};

	const removeLine = (sectionIndex: number, lineIndex: number) => {
		setSections((prev) =>
			prev.map((section, index) => {
				if (index !== sectionIndex) {
					return section;
				}

				return {
					...section,
					lines: section.lines.filter((_, currentLine) => currentLine !== lineIndex),
				};
			}),
		);
	};

	const updateLine = (
		sectionIndex: number,
		lineIndex: number,
		field: keyof SongLineForm,
		value: string,
	) => {
		setSections((prev) =>
			prev.map((section, index) => {
				if (index !== sectionIndex) {
					return section;
				}

				return {
					...section,
					lines: section.lines.map((line, currentLineIndex) =>
						currentLineIndex === lineIndex ? { ...line, [field]: value } : line,
					),
				};
			}),
		);
	};

	const handleNormalizeFromRawText = async () => {
		if (isEditMode) {
			return;
		}

		const rawText = rawInput.trim();
		if (!rawText) {
			setError("Vui long dan text tho truoc khi chuan hoa.");
			return;
		}

		try {
			setError(null);
			setMessage(null);
			setNormalizing(true);

			const normalized = await normalizeSong({
				rawText,
				title: title.trim() || undefined,
				category: category.trim() || undefined,
				audioUrl: audioUrl.trim() || undefined,
			});

			if (!normalized.payload) {
				setError("Khong nhan duoc du lieu chuan hoa tu backend.");
				return;
			}

			applyNormalizedPayload(normalized.payload);
			setMessage(
				`Da chuan hoa ${normalized.meta?.sectionsCount ?? normalized.payload.sections.length} section tu text tho.`,
			);
		} catch {
			setError("Chuan hoa that bai. Kiem tra format text hoac backend va thu lai.");
		} finally {
			setNormalizing(false);
		}
	};

	const buildPayload = (): CreateSongInput | null => {
		const normalizedSections: CreateSongSectionInput[] = sections
			.map((section) => ({
				title: section.title.trim(),
				lines: section.lines.reduce<CreateSongSectionInput["lines"]>((acc, line) => {
					const lyric = line.lyric.trim();
					const notes = line.notes.trim();

					if (!lyric && !notes) {
						return acc;
					}

					acc.push({
						lyric: lyric || " ",
						notes: notes || " ",
					});
					return acc;
				}, []),
			}))
			.filter((section) => section.title && section.lines.length > 0);

		if (!title.trim() || !category.trim() || normalizedSections.length === 0) {
			return null;
		}

		return {
			title: title.trim(),
			category: category.trim(),
			audioUrl: audioUrl.trim() || undefined,
			sections: normalizedSections,
		};
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setMessage(null);
		setError(null);

		const payload = buildPayload();

		if (!payload) {
			setError("Vui long nhap day du tieu de, the loai va it nhat 1 section hop le.");
			return;
		}

		if (isEditMode && !songId) {
			setError("Khong tim thay ID bai hat de cap nhat.");
			return;
		}

		try {
			setSubmitting(true);

			if (isEditMode && songId) {
				await updateSong(songId, payload);
				setMessage("Cap nhat bai hat thanh cong.");
			} else {
				await createSong(payload);
				setMessage("Them bai hat thanh cong.");
				resetForm();
			}

			onSaved?.();
		} catch {
			setError("Khong the luu bai hat. Vui long thu lai.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loadingSong) {
		return (
			<Card className="mt-5 rounded-2xl border-border/60 bg-card/80 shadow-sm">
				<CardContent className="py-10">
					<p className="text-sm text-muted-foreground">Dang tai du lieu bai hat...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mt-5 rounded-2xl border-border/60 bg-card/80 shadow-sm">
			<CardHeader>
				<CardTitle>{isEditMode ? "Chinh sua bai hat" : "Them bai hat moi"}</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-5" onSubmit={handleSubmit}>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="title">
								Tiêu đề
							</label>
							<Input
								id="title"
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder="Nhập tiêu đề bài hát"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="category">
								Thể loại
							</label>
							<Input
								id="category"
								value={category}
								onChange={(event) => setCategory(event.target.value)}
								placeholder="VD: Dân Ca, Nhạc Trẻ, ...."
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="audio-url">
							Link beat (link Youtube nếu có hoặc link mp3 đã upload)
						</label>
						<Input
							id="audio-url"
							value={audioUrl}
							onChange={(event) => setAudioUrl(event.target.value)}
							placeholder="https://..."
						/>
					</div>

					<div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4">
						<label className="text-sm font-medium" htmlFor="audio-file">
							Tải beat từ máy (chỉ nhận file mp3)
						</label>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<Input
								id="audio-file"
								type="file"
								accept="audio/mpeg,.mp3"
								onChange={handleUploadAudio}
								disabled={uploadingAudio}
							/>
							<Button
								type="button"
								variant="outline"
								disabled={uploadingAudio}
								className="gap-2 sm:w-auto"
							>
								{uploadingAudio ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Đang tải...
									</>
								) : (
									<>
										<Upload className="h-4 w-4" />
										MP3 only
									</>
								)}
							</Button>
						</div>
					</div>

					{!isEditMode && (
						<div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4">
							<label className="text-sm font-medium" htmlFor="raw-input">
								Dan text tho de backend chuan hoa tu dong
							</label>
							<textarea
								id="raw-input"
								value={rawInput}
								onChange={(event) => setRawInput(event.target.value)}
								rows={10}
								placeholder="Dan toan bo cam am/text tho vao day..."
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
							/>
							<div className="flex justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={handleNormalizeFromRawText}
									disabled={normalizing || submitting}
								>
									{normalizing ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Dang chuan hoa...
										</>
									) : (
										"Chuan hoa va dien vao form"
									)}
								</Button>
							</div>
						</div>
					)}

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-base font-semibold sm:text-lg">Các đoạn trong bài hát</h2>
							<Button type="button" variant="outline" size="sm" onClick={addSection}>
								<Plus className="h-4 w-4" />
								Thêm đoạn mới
							</Button>
						</div>

						{sections.map((section, sectionIndex) => (
							<Card key={sectionIndex} className="rounded-xl border-border/60 bg-background/70">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between gap-2">
										<CardTitle className="text-sm sm:text-base">Section {sectionIndex + 1}</CardTitle>
										{sections.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => removeSection(sectionIndex)}
												aria-label="Xoa section"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor={`section-title-${sectionIndex}`}>
											Ten section
										</label>
										<Input
											id={`section-title-${sectionIndex}`}
											value={section.title}
											onChange={(event) =>
												updateSectionTitle(sectionIndex, event.target.value)
											}
											placeholder="VD: Verse 1"
										/>
									</div>

									<div className="space-y-3">
										{section.lines.map((line, lineIndex) => (
											<div key={lineIndex} className="rounded-lg border border-border/60 p-3">
												<div className="mb-2 flex items-center justify-between">
													<p className="text-xs font-medium text-muted-foreground">
														Dong {lineIndex + 1}
													</p>
													{section.lines.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="icon-xs"
															onClick={() => removeLine(sectionIndex, lineIndex)}
															aria-label="Xoa dong"
														>
															<Trash2 className="h-3.5 w-3.5" />
														</Button>
													)}
												</div>
												<div className="grid gap-2 sm:grid-cols-2">
													<Input
														value={line.notes}
														onChange={(event) =>
															updateLine(sectionIndex, lineIndex, "notes", event.target.value)
														}
														placeholder="Notes"
													/>
													<Input
														value={line.lyric}
														onChange={(event) =>
															updateLine(sectionIndex, lineIndex, "lyric", event.target.value)
														}
														placeholder="Lyric"
													/>
												</div>
											</div>
										))}

										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => addLine(sectionIndex)}
										>
											<Plus className="h-4 w-4" />
											Them dong
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{error && <p className="text-sm font-medium text-destructive">{error}</p>}
					{message && <p className="text-sm font-medium text-emerald-600">{message}</p>}

					<Button type="submit" disabled={submitting} className="gap-2">
						<Save className="h-4 w-4" />
						{submitting
							? "Dang luu..."
							: isEditMode
								? "Cap nhat bai hat"
								: "Luu bai hat"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
