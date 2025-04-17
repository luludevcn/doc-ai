import { saveAs } from 'file-saver';
import pptxgen from 'pptxgenjs';
import { Packer } from 'docx';
// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import JSZip from 'jszip';

// (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

// export const exportAsPDF = (content: string, title: string) => {
//   const documentDefinition = {
//     content: [
//       { text: title, style: 'header' },
//       { text: content, style: 'content' },
//     ],
//     styles: {
//       header: {
//         fontSize: 18,
//         bold: true,
//         margin: [0, 0, 0, 10],
//       },
//       content: {
//         fontSize: 12,
//       },
//     },
//   };

//   const pdfDoc = (pdfMake as any).createPdf(documentDefinition);
//   pdfDoc.download(`${title}.pdf`);
// };

export const exportAsWord = async (content: string, title: string) => {
  const { Document, Paragraph, TextRun, HeadingLevel } = await import('docx');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: content,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  saveAs(new Blob([buffer]), `${title}.docx`);
};

// export const exportAsPPT = (content: string, title: string) => {
//   const pptx = new pptxgen();
//   const slides = content.split('\n\n');

//   slides.forEach((slideContent, index) => {
//     const slide = pptx.addSlide();
//     slide.addText(slideContent, {
//       x: 0.5,
//       y: 0.5,
//       w: 9,
//       h: 6,
//       fontSize: 14,
//     });
    
//     if (index === 0) {
//       slide.addText(title, {
//         x: 0.5,
//         y: 0.2,
//         w: 9,
//         h: 0.5,
//         fontSize: 24,
//         bold: true,
//       });
//     }
//   });

//   pptx.writeFile(`${title}.pptx`);
// };

export const exportAsTXT = (content: string, title: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title}.txt`);
};

export const exportAsEPUB = async (content: string, title: string) => {
  // This is a simplified EPUB export - in a real app you'd use a proper EPUB library
  const zip = new JSZip();
  
  // Mimetype file (required for EPUB)
  zip.file("mimetype", "application/epub+zip");
  
  // Container file (required for EPUB)
  const container = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file("META-INF/container.xml", container);
  
  // Content OPF file
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${Math.random().toString(36).substring(2)}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Document Generator</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="toc"/>
    <itemref idref="content"/>
  </spine>
</package>`;
  zip.file("OEBPS/content.opf", opf);
  
  // Content XHTML file
  const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <div>${content.replace(/\n/g, '<br/>')}</div>
</body>
</html>`;
  zip.file("OEBPS/content.xhtml", xhtml);
  
  // TOC XHTML file
  const toc = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="content.xhtml">${title}</a></li>
    </ol>
  </nav>
</body>
</html>`;
  zip.file("OEBPS/toc.xhtml", toc);
  
  // Generate the EPUB file
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${title}.epub`);
};