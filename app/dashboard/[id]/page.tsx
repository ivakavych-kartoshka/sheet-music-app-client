"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { SongForm } from "@/app/dashboard/components/song-form";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { useToast } from "@/hooks/use-toast";

export default function EditSongPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const songId = params?.id;
	const { toast } = useToast();

	const handleLogout = () => {
		sessionStorage.removeItem("verified");
		toast({
			title: "Thành công",
			description: "Đã thoát phiên làm việc.",
		});
		setTimeout(() => {
			router.push("/verify-password");
		}, 1000);
	};

	if (!songId) {
		return (
			<AuthGuard>
				<main className="relative min-h-screen overflow-hidden bg-background text-foreground">
					<section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
						<p className="text-sm text-destructive">Không tìm thấy ID bài hát.</p>
					</section>
				</main>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard>
			<main className="relative min-h-screen overflow-hidden bg-background text-foreground">
				<section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between gap-3">
					<Link href="/dashboard" className="inline-block">
						<Button variant="outline" className="gap-2 rounded-xl">
							<ArrowLeft className="h-4 w-4" />
							Về trang quản lý
						</Button>
					</Link>
					<Button 
						variant="outline" 
						onClick={handleLogout}
						className="gap-2 rounded-xl"
					>
						<LogOut className="h-4 w-4" />
						Logout
					</Button>
				</div>

				<SongForm mode="edit" songId={songId} onSaved={() => router.push("/dashboard")} />
				</section>
			</main>
		</AuthGuard>
	);
}
