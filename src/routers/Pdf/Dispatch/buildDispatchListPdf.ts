//@ts-ignore
import PdfPrinter from 'pdfmake';
import buildOrderTable from './buildOrderTable';
import { styles } from '../styles';
import { fonts } from '../fonts';

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

const buildDispatchListPdf = ({ products }: any) => {
  return printer.createPdfKitDocument(docDefinition({ products }), {
    defaultStyle: {
      font: 'SweetSansPro',
    },
  });
};

export default buildDispatchListPdf;
