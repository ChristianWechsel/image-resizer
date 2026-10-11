export type ResizeTestdata = {
  name: string;
  query: string;
  expectedWidth: number;
  expectedHeight: number;
};

export const sourceImageSize = { width: 400, height: 300 };

export class ResizeTestdataFactory {
  default_width(): ResizeTestdata {
    return {
      name: "defaults to width 200 keeping the aspect ratio",
      query: "",
      expectedWidth: 200,
      expectedHeight: 150,
    };
  }

  custom_width(): ResizeTestdata {
    return {
      name: "custom width keeps the aspect ratio",
      query: "?width=100",
      expectedWidth: 100,
      expectedHeight: 75,
    };
  }

  width_and_height(): ResizeTestdata {
    return {
      name: "width and height fill the requested size",
      query: "?width=120&height=80",
      expectedWidth: 120,
      expectedHeight: 80,
    };
  }

  height_only(): ResizeTestdata {
    return {
      name: "height only combines with the default width",
      query: "?height=50",
      expectedWidth: 200,
      expectedHeight: 50,
    };
  }
}
