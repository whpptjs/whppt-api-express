//@ts-ignore
import PdfPrinter from 'pdfmake';
import { styles } from '../styles';
import { fonts } from '../fonts';
import header from '../header';
import buildReceiptItems from './buildReceiptItems';
import subheader from './subheader';
import { footer } from './footer';

const printer = new PdfPrinter(fonts);

const docDefinition = ({ order, contact, memberTier }: any) => {
  return {
    info: {
      title: 'Order',
      author: 'Hentley Farm',
      subject: '',
    },
    styles: styles,
    content: [
      ...header(order.orderNumber || order._id, order?.payment?.date || order.updatedAt),
      ...subheader(order, contact, memberTier),
      ...buildReceiptItems(order.items),
      footer(order),
    ],
    pageMargins: [0, 0],
  };
};

const buildReceiptPdf = ({ order, contact, memberTier }: any) => {
  return printer.createPdfKitDocument(docDefinition({ order, contact, memberTier }), {
    defaultStyle: {
      font: 'SweetSansPro',
    },
  });
};

export default buildReceiptPdf;
