import { NextResponse } from "next/server";

export interface CustomAgentResponseBody extends NextResponse {
    message: string;
    success?: boolean;
    iri?: string;
};