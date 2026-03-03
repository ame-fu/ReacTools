declare module "pdf-signature-reader" {
  function verifyPDF(buffer: Buffer): { signatures?: unknown[]; error?: boolean; message?: string };
  export default verifyPDF;
}
