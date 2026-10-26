import { ImageResponse } from "next/og";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const px = size === "192" ? 192 : 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ef4444",
          fontSize: px * 0.6,
          fontWeight: 800,
        }}
      >
        M
      </div>
    ),
    { width: px, height: px },
  );
}
