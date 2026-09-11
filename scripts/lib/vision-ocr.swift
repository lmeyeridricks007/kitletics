import Vision
import AppKit
import Foundation

let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path),
      let tiff = img.tiffRepresentation,
      let rep = NSBitmapImageRep(data: tiff),
      let cg = rep.cgImage else {
  fputs("failed to load\n", stderr)
  exit(1)
}
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = false
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try! handler.perform([req])
let texts = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }
print(texts.joined(separator: "\n"))
