class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1) Filtering
  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ["sort", "page", "limit", "fields"];

    excludedFields.forEach((query) => delete queryObj[query]);

    queryObj = JSON.stringify(queryObj).replace(
      /\b(gte|lte|gt|lt)\b/g,
      (match) => `$${match}`
    );

    console.log(queryObj);

    this.query = this.query.find(JSON.parse(queryObj));
    return this;
  }

  // 2) Sorting
  sort() {
    this.query.sort(this.queryString.sort || "-createdAt");
    return this;
  }

  // 3) Field Limiting
  limitFields() {
    this.queryString.fields =
      this.queryString.fields?.replace(/\s+/g, "").split(",").join(" ") ||
      "-__v";
    this.query = this.query.select(this.queryString.fields);
    return this;
  }

  // 4) Pagination
  paginate() {
    const limit = this.queryString.limit || 100;
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
