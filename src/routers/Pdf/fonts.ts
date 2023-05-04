import * as path from 'path';

const rootDirectory = path.resolve(__dirname, '../../');

export const fonts: any = {
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
