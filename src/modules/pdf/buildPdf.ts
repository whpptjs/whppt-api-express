//@ts-ignore
import PdfPrinter from 'pdfmake';
import header from './pdfHeader';
import footer from './pdfFooter';
import buildOrderTable from './buildOrderTable';
import * as path from 'path';

const rootDirectory = path.resolve(__dirname, '../../');
console.log('🚀 ~ file: buildPdf.ts:9 ~ rootDirectory', rootDirectory);
const fonts: any = {
  Roboto: {
    normal: path.join(rootDirectory, 'fonts', 'Roboto', 'Roboto-Regular.ttf'),
    bold: path.join(rootDirectory, 'fonts', 'Roboto', 'Roboto-Bold.ttf'),
    thin: path.join(rootDirectory, 'fonts', 'Roboto', 'Roboto-Thin.ttf'),
    light: path.join(rootDirectory, 'fonts', 'Roboto', 'Roboto-Light.ttf'),
    medium: path.join(rootDirectory, 'fonts', 'Roboto', 'Roboto-Medium.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

const docDefinition = ({ products }: any) => {
  return {
    pageMargins: [0, 60, 0, 0],
    info: {
      title: 'Orders dispatch',
      author: 'Hentley Farm',
      subject: 'Daily orders',
    },
    header,
    footer,
    content: [...header, ...buildOrderTable(products), ...footer],
  };
};

const buildPdf = ({ products }: any) => {
  //@ts-ignore
  return printer.createPdfKitDocument(docDefinition({ products }));
};

export default buildPdf;
