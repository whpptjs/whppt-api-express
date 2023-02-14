//@ts-ignore
import PdfPrinter from 'pdfmake';
import buildOrderTable from './buildOrderTable';
import * as path from 'path';
import { styles } from './styles';

const rootDirectory = path.resolve(__dirname, '../../');

const fonts: any = {
  SweetSansPro: {
    normal: path.join(rootDirectory, 'fonts', 'SweetSansPro', 'SweetSansPro-Regular.ttf'),
    bold: path.join(rootDirectory, 'fonts', 'SweetSansPro', 'SweetSansPro-Bold.ttf'),
    thin: path.join(rootDirectory, 'fonts', 'SweetSansPro', 'SweetSansPro-Thin.ttf'),
    light: path.join(rootDirectory, 'fonts', 'SweetSansPro', 'SweetSansPro-Light.ttf'),
    medium: path.join(rootDirectory, 'fonts', 'SweetSansPro', 'SweetSansPro-Medium.ttf'),
  },
  Roxborough: {
    normal: path.join(rootDirectory, 'fonts', 'Roxborough', 'Roxborough-CF.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

const docDefinition = ({ products }: any) => {
  return {
    info: {
      title: 'Orders dispatch',
      author: 'Hentley Farm',
      subject: 'Daily orders',
    },
    styles: styles,
    content: [...buildOrderTable(products)],
    pageMargins: [0, 0],
  };
};

const buildPdf = ({ products }: any) => {
  return printer.createPdfKitDocument(docDefinition({ products }), {
    defaultStyle: {
      font: 'SweetSansPro',
    },
  });
};

export default buildPdf;
