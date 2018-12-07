import assert from "assert";
import svgRecolor from "../src/";
import { replacements, windowColors, neonColors } from "../src/colorMatches";

describe("basic operation", () => {
  it("should replace primary color", () => {
    const color = replacements.primary[0];
    const output = svgRecolor({
      svg: color,
      primary: "red",
      secondary: "green"
    });
    assert.deepEqual(output, "red", "Should convert primary color to red");
  });
  // it("should replace some colours", () => {
  //    colors.forEach(color => )
  // });
});
