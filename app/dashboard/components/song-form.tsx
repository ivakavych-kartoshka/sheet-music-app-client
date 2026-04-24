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
	uploadSheetFiles,
} from "@/app/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
	const [sheetUrls, setSheetUrls] = useState<string[]>([]);
	const [rawInput, setRawInput] = useState("");
	const [sections, setSections] = useState<SongSectionForm[]>([
		createEmptySection(),
	]);
	const [loadingSong, setLoadingSong] = useState(isEditMode);
	const [uploadingAudio, setUploadingAudio] = useState(false);
	const [uploadingSheet, setUploadingSheet] = useState(false);
	const [normalizing, setNormalizing] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { toast } = useToast();

	const resetForm = () => {
		setTitle("");
		setCategory("");
		setAudioUrl("");
		setSheetUrls([]);
		setRawInput("");
		setSections([createEmptySection()]);
	};

	const applyNormalizedPayload = (payload: CreateSongInput) => {
		setTitle(payload.title?.trim() || "");
		setCategory(payload.category?.trim() || "");
		setAudioUrl(payload.audioUrl?.trim() || "");
		setSheetUrls(
			payload.sheetUrls && payload.sheetUrls.length > 0
				? payload.sheetUrls.map((item) => item.trim()).filter(Boolean)
				: payload.sheetUrl?.trim()
					? [payload.sheetUrl.trim()]
					: [],
		);
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
				setLoadingSong(true);
				const song = await getSongById(songId);

				if (!mounted) {
					return;
				}

				setTitle(song.title?.trim() || "");
				setCategory(song.category?.trim() || "");
				setAudioUrl(song.audioUrl?.trim() || "");
				setSheetUrls(
					song.sheetUrls && song.sheetUrls.length > 0
						? song.sheetUrls.map((item) => item.trim()).filter(Boolean)
						: song.sheetUrl?.trim()
							? [song.sheetUrl.trim()]
							: [],
				);
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
				toast({
					title: "Lỗi",
					description: "Không thể tải bài hát để chỉnh sửa.",
					variant: "destructive",
				});
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
			toast({
				title: "Lỗi",
				description: "Chỉ hỗ trợ file mp3.",
				variant: "destructive",
			});
			event.target.value = "";
			return;
		}

		try {
			setUploadingAudio(true);

			const result = await uploadAudioFile(selectedFile);

			if (!result.audioUrl) {
				throw new Error("Upload failed");
			}

			setAudioUrl(result.audioUrl);
			toast({
				title: "Thành công",
				description: "Upload audio thành công.",
			});
		} catch {
			toast({
				title: "Lỗi",
				description: "Upload audio thất bại.",
				variant: "destructive",
			});
		} finally {
			setUploadingAudio(false);
			event.target.value = "";
		}
	};

	const handleUploadSheet = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFiles = event.target.files ? Array.from(event.target.files) : [];

		if (selectedFiles.length === 0) {
			return;
		}

		const acceptedTypes = ["image/png", "image/jpeg", "application/pdf"];
		const isSupported = selectedFiles.every((file) => {
			const lowerName = file.name.toLowerCase();
			return (
				acceptedTypes.includes(file.type) ||
				lowerName.endsWith(".png") ||
				lowerName.endsWith(".jpg") ||
				lowerName.endsWith(".jpeg") ||
				lowerName.endsWith(".pdf")
			);
		});

		if (!isSupported) {
			toast({
				title: "Lỗi",
				description: "Chỉ hỗ trợ file png, jpg, jpeg hoặc pdf.",
				variant: "destructive",
			});
			event.target.value = "";
			return;
		}

		try {
			setUploadingSheet(true);
			const result = await uploadSheetFiles(selectedFiles);

			if (!result.sheetUrls || result.sheetUrls.length === 0) {
				throw new Error("Upload failed");
			}

			setSheetUrls((prev) => [...prev, ...result.sheetUrls!]);
			toast({
				title: "Thành công",
				description: `Upload ${result.sheetUrls.length} sheet nhạc thành công.`,
			});
		} catch {
			toast({
				title: "Lỗi",
				description: "Upload sheet nhạc thất bại.",
				variant: "destructive",
			});
		} finally {
			setUploadingSheet(false);
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
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập lời bài hát và nốt trước khi format.",
				variant: "destructive",
			});
			return;
		}

		try {
			setNormalizing(true);

			const normalized = await normalizeSong({
				rawText,
				title: title.trim() || undefined,
				category: category.trim() || undefined,
				audioUrl: audioUrl.trim() || undefined,
			});

			if (!normalized.payload) {
				toast({
					title: "Lỗi",
					description: "Không nhận được dữ liệu chuẩn hóa.",
					variant: "destructive",
				});
				return;
			}

			applyNormalizedPayload(normalized.payload);
			toast({
				title: "Thành công",
				description: `Đã chuẩn hóa ${normalized.meta?.sectionsCount ?? normalized.payload.sections.length} section.`,
			});
		} catch {
			toast({
				title: "Lỗi",
				description: "Chuẩn hóa thất bại. Kiểm tra format text và thử lại.",
				variant: "destructive",
			});
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

		if (!title.trim() || !category.trim()) {
			return null;
		}

		return {
			title: title.trim(),
			category: category.trim(),
			audioUrl: audioUrl.trim() || undefined,
			sheetUrl: sheetUrls[0] || undefined,
			sheetUrls: sheetUrls.length > 0 ? sheetUrls : undefined,
			sections: normalizedSections.length > 0 ? normalizedSections : [],
		};
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const payload = buildPayload();

		if (!payload) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tiêu đề và thể loại.",
				variant: "destructive",
			});
			return;
		}

		if (isEditMode && !songId) {
			toast({
				title: "Lỗi",
				description: "Không tìm thấy ID bài hát để cập nhật.",
				variant: "destructive",
			});
			return;
		}

		try {
			setSubmitting(true);

			if (isEditMode && songId) {
				await updateSong(songId, payload);
				toast({
					title: "Thành công",
					description: "Cập nhật bài hát thành công.",
				});
			} else {
				await createSong(payload);
				toast({
					title: "Thành công",
					description: "Thêm bài hát thành công.",
				});
				resetForm();
			}

			onSaved?.();
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể lưu bài hát. Vui lòng thử lại.",
				variant: "destructive",
			});
		} finally {
			setSubmitting(false);
		}
	};

	if (loadingSong) {
		return (
			<Card className="mt-5 rounded-2xl border-border/60 bg-card/80 shadow-sm">
				<CardContent className="py-10">
					<p className="text-sm text-muted-foreground">Đang tải dữ liệu bài hát...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mt-5 rounded-2xl border-border/60 bg-card/80 shadow-sm">
			<CardHeader>
				<CardTitle>{isEditMode ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}</CardTitle>
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

					<div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4">
						<label className="text-sm font-medium" htmlFor="sheet-file">
							Tải sheet nhạc từ máy (nhiều file png, jpg, pdf)
						</label>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<Input
								id="sheet-file"
								type="file"
								multiple
								accept="image/png,image/jpeg,application/pdf,.png,.jpg,.jpeg,.pdf"
								onChange={handleUploadSheet}
								disabled={uploadingSheet}
							/>
							<Button
								type="button"
								variant="outline"
								disabled={uploadingSheet}
								className="gap-2 sm:w-auto"
							>
								{uploadingSheet ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Đang tải...
									</>
								) : (
									<>
										<Upload className="h-4 w-4" />
										Sheet file
									</>
								)}
							</Button>
						</div>
						{sheetUrls.length > 0 ? (
							<div className="space-y-2">
								<p className="text-xs text-muted-foreground">
									Đã có {sheetUrls.length} sheet:
								</p>
								<div className="space-y-1">
									{sheetUrls.map((url, index) => (
										<div
											key={`${url}-${index}`}
											className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-2 py-1.5 text-xs"
										>
											<span className="truncate">Sheet {index + 1}: {url}</span>
											<Button
												type="button"
												variant="ghost"
												size="icon-xs"
												onClick={() =>
													setSheetUrls((prev) => prev.filter((_, i) => i !== index))
												}
												aria-label="Xóa sheet"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
									))}
								</div>
							</div>
						) : null}
					</div>

					{!isEditMode && (
						<div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4">
							<label className="text-sm font-medium" htmlFor="raw-input">
								Dán lời bài hát và nốt ở đây để format tự động:
							</label>
							<textarea
								id="raw-input"
								value={rawInput}
								onChange={(event) => setRawInput(event.target.value)}
								rows={10}
								placeholder="Dán toàn bộ lời bài hát và nốt ở đây..."
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
											Đang format...
										</>
									) : (
										"Format"
									)}
								</Button>
							</div>
						</div>
					)}

					<div className="space-y-4">
						<div className="flex items-center justify-between gap-2">
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
										<CardTitle className="text-sm sm:text-base">Đoạn {sectionIndex + 1}</CardTitle>
										{sections.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => removeSection(sectionIndex)}
												aria-label="Xóa đoạn nhạc này"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor={`section-title-${sectionIndex}`}>
											Tên đoạn nhạc:
										</label>
										<Input
											id={`section-title-${sectionIndex}`}
											value={section.title}
											onChange={(event) =>
												updateSectionTitle(sectionIndex, event.target.value)
											}
											placeholder="VD: Đoạn 1"
										/>
									</div>

									<div className="space-y-3">
										{section.lines.map((line, lineIndex) => (
											<div key={lineIndex} className="rounded-lg border border-border/60 p-3">
												<div className="mb-2 flex items-center justify-between">
													<p className="text-xs font-medium text-muted-foreground">
														Dòng {lineIndex + 1}
													</p>
													{section.lines.length > 1 && (
														<Button
															type="button"
																variant="ghost"
																size="icon-xs"
																onClick={() => removeLine(sectionIndex, lineIndex)}
																aria-label="Xóa dòng"
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
														placeholder="Nốt"
													/>
													<Input
														value={line.lyric}
														onChange={(event) =>
															updateLine(sectionIndex, lineIndex, "lyric", event.target.value)
														}
														placeholder="Lời bài hát"
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
											Thêm dòng mới
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<Button type="submit" disabled={submitting} className="gap-2">
						<Save className="h-4 w-4" />
						{submitting
							? "Đang lưu..."
							: isEditMode
								? "Cập nhật bài hát"
								: "Lưu bài hát mới"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
