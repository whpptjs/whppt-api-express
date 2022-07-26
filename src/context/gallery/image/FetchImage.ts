import Sharp from 'sharp';
import { ContextType } from '../../Context';
import { FetchOriginalImage } from './FetchOriginalImage';

export type FetchImageFormat = {
  w: string; // width to resize to eg. '666'
  h: string; // height to resize to eg. '500'
  f: string; // file format to change to eg. 'jpg'
  cx: string; // crop top left corner x coordinate eg. '5'
  cy: string; // crop top left corner y coordinate eg. '5'
  cw: string; // crop width eg. '500'
  ch: string; // crop height eg. '500'
  q: string; // quality to forma to eg. '70'
  o: string; // return the original image eg. 'true'
  s: string; // scale the resizing by a factor eg. '1.5'
  t: string; // output image as transparent. Will be a png
};

export const parseImageFormat = (args: any) => {
  const format: FetchImageFormat = { ...args };
  return format;
};

export type FetchImageArgs = {
  format: FetchImageFormat;
  itemId: string;
  accept?: string;
};

export type FetchImage = (args: FetchImageArgs) => Promise<void>;
export type FetchImageConstructor = (context: ContextType, fetchOriginal: FetchOriginalImage) => FetchImage;

const baseImageScale = parseFloat(process.env.BASE_IMAGE_SCALE || '1') || 1;

export type OptimisedImage = { contentType: string; img: Sharp.Sharp };
export type OptimiseOptions = { [key: string]: (image: Sharp.Sharp, quality: number) => OptimisedImage };

const optimise: OptimiseOptions = {
  jpg: (image, quality) => ({ contentType: 'image/jpeg', img: image.jpeg({ quality, chromaSubsampling: '4:4:4' }) }),
  jpeg: (image, quality) => ({ contentType: 'image/jpeg', img: image.jpeg({ quality, chromaSubsampling: '4:4:4' }) }),
  webp: (image, quality) => ({ contentType: 'image/webp', img: image.webp({ quality }) }),
  png: (image, quality) => ({ contentType: 'image/png', img: image.png({ quality }) }),
};

const pickFormat = function (format: FetchImageFormat, accept: string, imageMeta: any) {
  if (!format.f) return accept.indexOf('image/webp') !== -1 ? 'webp' : format.t ? 'png' : 'jpg';
  if (format.f === 'orig') return imageMeta.type.split('/')[1];

  return format.f || imageMeta.type.split('/')[1] || format.t ? 'png' : 'jpg';
};

export const FetchImage: FetchImageConstructor = ({ $aws, $mongo: { $db } }, fetchOriginal) => ({ format, itemId, accept = '' }) => {
  if (format.o) return fetchOriginal({ itemId });

  return Promise.all([$db.collection('gallery').findOne({ _id: itemId }), $aws.fetchFromS3(itemId)]).then(([imageMeta, { fileBuffer }]) => {
    const _sharpImage = Sharp(fileBuffer);
    let _extractedImage = _sharpImage;
    if (format.cx && format.cy && format.cw && format.ch) {
      _extractedImage = _sharpImage.extract({ left: parseInt(format.cx), top: parseInt(format.cy), width: parseInt(format.cw), height: parseInt(format.ch) });
    }
    const scale = parseFloat(format.s) || baseImageScale;
    const _resizedImage =
      format.w && format.h
        ? _extractedImage.resize(Math.ceil(parseFloat(format.w) * scale), Math.ceil(parseFloat(format.h) * scale), {
            withoutEnlargement: true,
          })
        : _extractedImage;
    const imageType = pickFormat(format, accept, imageMeta);
    const quality = parseInt(format.q) || 70;
    const { img: optimisedImage, contentType } = optimise[imageType](_resizedImage, quality);
    return optimisedImage.toBuffer().then(processedImageBuffer => {
      return {
        Body: processedImageBuffer,
        ContentType: contentType,
      };
    });
  });
};
