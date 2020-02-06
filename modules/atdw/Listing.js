class Listing {
  constructor(props) {
    this._id = props._id;
    this.atdw = props.atdw || {};
    this.hasFullATDWData = props.hasFullATDWData || false;
    this.bookEasy = props.bookEasy || {};
    this.name = props.name || {};
    this.description = props.description || {};
    this.image = props.image || {};
    this.address = props.address || {};
    this.categories = props.categories || [];
  }
}

module.exports = Listing;
