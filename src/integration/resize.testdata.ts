export type ResizeTestdata = {
  name: string;
  query: string;
  expectedWidth: number;
  expectedHeight: number;
  expectedFormat: "png" | "jpeg";
  expectedContentType: "image/png" | "image/jpeg";
};

export class ResizeTestdataFactory {
  default_width(): ResizeTestdata {
    return {
      name: "defaults to width 200 keeping the aspect ratio",
      query: "",
      expectedWidth: 200,
      expectedHeight: 150,
      expectedFormat: "png",
      expectedContentType: "image/png",
    };
  }

  custom_width(): ResizeTestdata {
    return {
      name: "custom width keeps the aspect ratio",
      query: "?width=100",
      expectedWidth: 100,
      expectedHeight: 75,
      expectedFormat: "png",
      expectedContentType: "image/png",
    };
  }

  width_and_height(): ResizeTestdata {
    return {
      name: "width and height fill the requested size",
      query: "?width=120&height=80",
      expectedWidth: 120,
      expectedHeight: 80,
      expectedFormat: "png",
      expectedContentType: "image/png",
    };
  }

  height_only(): ResizeTestdata {
    return {
      name: "height only combines with the default width",
      query: "?height=50",
      expectedWidth: 200,
      expectedHeight: 50,
      expectedFormat: "png",
      expectedContentType: "image/png",
    };
  }

  request_jpeg(): ResizeTestdata {
    return {
      name: "request jpeg",
      query: "?format=jpeg",
      expectedWidth: 200,
      expectedHeight: 150,
      expectedFormat: "jpeg",
      expectedContentType: "image/jpeg",
    };
  }

  request_png(): ResizeTestdata {
    return {
      name: "request png",
      query: "?format=png",
      expectedWidth: 200,
      expectedHeight: 150,
      expectedFormat: "png",
      expectedContentType: "image/png",
    };
  }
}
