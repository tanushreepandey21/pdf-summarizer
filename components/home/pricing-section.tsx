import { FileText, Download, Check, Sparkles, FileDown } from "lucide-react";

export default function Pricing() {
  return (
    <section className="w-full bg-white px-6 py-20">
      {/* Heading */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <span className="inline-block rounded-full bg-rose-100 px-6 py-2 text-sm font-bold tracking-wide text-rose-600">
          POWERFUL PDF TOOLS
        </span>

        <p className="mt-4 text-base text-gray-500">
          More than just a summary — get everything you need to study smarter.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-7 md:grid-cols-2">

        {/* Smart Notes */}
        <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-linear-to-br from-white to-pink-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <FileText className="h-8 w-8 text-red-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900">
            Smart Notes
          </h3>

          <p className="mt-3 max-w-md text-gray-600">
            Turn lengthy PDFs into concise and easy-to-understand notes.
          </p>

          <div className="mt-7 space-y-4">

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-600 p-1 text-white" />
              <span className="text-gray-600">
                AI-powered summarization
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-600 p-1 text-white" />
              <span className="text-gray-600">
                Key points extraction
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-600 p-1 text-white" />
              <span className="text-gray-600">
                Important concepts highlighted
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-600 p-1 text-white" />
              <span className="text-gray-600">
                Save hours of reading time
              </span>
            </div>

          </div>

          {/* Document illustration */}
          <div className="absolute bottom-8 right-8 hidden h-40 w-32 rounded-2xl border border-pink-100 bg-white p-5 shadow-md sm:block">

            <div className="mb-4 flex justify-end">
              <Sparkles className="h-5 w-5 text-red-600" />
            </div>

            <div className="space-y-3">
              <div className="h-2 w-full rounded-full bg-red-100" />
              <div className="h-2 w-4/5 rounded-full bg-red-600" />
              <div className="h-2 w-full rounded-full bg-gray-100" />
              <div className="h-2 w-3/5 rounded-full bg-red-100" />
              <div className="h-2 w-full rounded-full bg-gray-100" />
              <div className="h-2 w-4/5 rounded-full bg-red-200" />
            </div>

          </div>
        </div>


        {/* Export & Share */}
        <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-white to-red-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <Download className="h-8 w-8 text-red-500" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900">
            Export & Share
          </h3>

          <p className="mt-3 max-w-md text-gray-600">
            Save and share your generated notes in multiple formats.
          </p>

          <div className="mt-7 space-y-4">

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-500 p-1 text-white" />
              <span className="text-gray-600">
                Download as PDF
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-500 p-1 text-white" />
              <span className="text-gray-600">
                Export as TXT or Markdown
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-500 p-1 text-white" />
              <span className="text-gray-600">
                Share with classmates
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 rounded-full bg-red-500 p-1 text-white" />
              <span className="text-gray-600">
                Keep your notes organized
              </span>
            </div>

          </div>

          {/* File illustration */}
          <div className="absolute bottom-7 right-8 hidden sm:block">

            <div className="relative h-40 w-36">

              <div className="absolute left-0 top-5 flex h-24 w-20 items-center justify-center rounded-xl border border-red-100 bg-white shadow-md">
                <div className="text-center">
                  <FileDown className="mx-auto h-7 w-7 text-red-500" />
                  <span className="mt-1 block text-xs font-bold text-red-500">
                    PDF
                  </span>
                </div>
              </div>

              <div className="absolute right-0 top-0 flex h-24 w-20 items-center justify-center rounded-xl border border-blue-100 bg-white shadow-md">
                <div className="text-center">
                  <FileText className="mx-auto h-7 w-7 text-blue-500" />
                  <span className="mt-1 block text-xs font-bold text-blue-500">
                    TXT
                  </span>
                </div>
              </div>

              <div className="absolute bottom-0 left-5 flex h-24 w-20 items-center justify-center rounded-xl border border-purple-100 bg-white shadow-md">
                <div className="text-center">
                  <FileText className="mx-auto h-7 w-7 text-purple-500" />
                  <span className="mt-1 block text-xs font-bold text-purple-500">
                    MD
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}