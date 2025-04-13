"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	CheckCircle2,
	AlertCircle,
	FileText,
	Clock,
	ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { GoogleDocsIcon } from "@/components/ui/icons/google-docs";

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	webViewLink: string;
	createdTime: string;
	modifiedTime: string;
	thumbnailLink?: string;
}

export default function GoogleDocsIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [files, setFiles] = useState<DriveFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);

	const isConnected = user?.externalAccounts?.some(
		(account) =>
			account.provider === "google" &&
			account.approvedScopes.includes(
				"https://www.googleapis.com/auth/drive.file",
			),
	);

	useEffect(() => {
		async function fetchDriveFiles() {
			if (!userLoaded || !isConnected) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/google-docs/data", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error, { cause: errorData });
				}

				const data = await response.json();
				setFiles(data.files || []);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError({
						message: err.message,
						details: err.cause,
					});
				} else {
					setError({ message: "An unknown error occurred" });
				}
			} finally {
				setLoading(false);
			}
		}

		fetchDriveFiles();
	}, [userLoaded, isConnected]);

	if (!userLoaded || loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<p>Loading...</p>
			</div>
		);
	}

	if (!isConnected) {
		return (
			<div className="p-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<GoogleDocsIcon />
							<span>Google Docs Integration</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Connect your Google Docs to view your documents.
						</p>
						<Button asChild>
							<Link href="/sign-in?redirect=/integrations/google-docs">
								Connect Google Docs
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<Card>
					<CardContent>
						<p className="text-red-500">Error: {error.message}</p>
						<pre className="text-sm text-gray-500 mt-2">
							Details: {JSON.stringify(error.details ?? {}, null, 2)}
						</pre>
						<Button variant="outline" className="mt-4" asChild>
							<Link href="/sign-in?redirect=/integrations/google-docs">
								Reconnect Google Docs
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="h-full flex-1 flex-col space-y-8 p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<GoogleDocsIcon />
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Google Docs Integration
						</h2>
						<p className="text-muted-foreground">View your documents</p>
					</div>
					<Badge
						variant="default"
						className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
					>
						<CheckCircle2 className="mr-1 h-3 w-3" />
						Connected
					</Badge>
				</div>
			</div>

			{/* Documents List */}
			<Card>
				<CardHeader>
					<CardTitle>Your Documents</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{files.length === 0 && (
							<p className="text-muted-foreground">No documents found.</p>
						)}
						{files.map((file) => (
							<div
								key={file.id}
								className="flex items-start space-x-4 border-b pb-4 last:border-0"
							>
								<div className="p-2 rounded-md bg-blue-500/10">
									<FileText className="h-5 w-5 text-blue-500" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<p className="font-medium truncate">{file.name}</p>
										<Button variant="ghost" size="sm" className="ml-2" asChild>
											<Link href={file.webViewLink} target="_blank">
												<ExternalLink className="h-4 w-4" />
											</Link>
										</Button>
									</div>
									<div className="flex items-center space-x-4 mt-1">
										<div className="flex items-center text-xs text-muted-foreground">
											<Clock className="h-3 w-3 mr-1" />
											Modified: {new Date(file.modifiedTime).toLocaleString()}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
