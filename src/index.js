import Color from "./color";
import {
  colorReplacements,
  colorReplacementsWindow,
  colorReplacementsNeon
} from "./colorMatches";

function makeReplacement(haystack, type, before, after) {
  var search = new RegExp(type + ":" + before, "g");
  return haystack.replace(search, type + ":" + after);
}

function recolour(svg, type, newBase) {
  var baseColor = Color(newBase);
  var fills = {
    fill: [
      baseColor.darkenByRatio(0.2).toCSS(),
      baseColor.toCSS(),
      baseColor.lightenByRatio(0.1).toCSS(),
      baseColor.lightenByRatio(0.2).toCSS()
    ],
    stroke: [
      baseColor.darkenByRatio(0.3).toCSS(),
      baseColor.darkenByRatio(0.1).toCSS(),
      baseColor.lightenByRatio(0.2).toCSS(),
      baseColor.lightenByRatio(0.3).toCSS()
    ]
  };

  for (var i = 0; i < colorReplacements[type].length; i++) {
    svg = makeReplacement(
      svg,
      "fill",
      colorReplacements[type][i],
      fills.fill[i]
    );
    svg = makeReplacement(
      svg,
      "stop-color",
      colorReplacements[type][i],
      fills.fill[i]
    );
    svg = makeReplacement(
      svg,
      "stroke",
      colorReplacements[type][i],
      fills.stroke[i]
    );
  }

  return svg;
}

function colorEq(a, b) {
  if (typeof a == "undefined" || typeof b == "undefined") return false;
  return a.toUpperCase() == b.toUpperCase();
}

function numberBetween(a, b, c) {
  return a < c && b > c;
}

function recolorEvening(str, oldColor, time, opts) {
  if (colorEq(oldColor, colorReplacementsNeon.on)) {
    return oldColor + ";";
  } else if (colorEq(oldColor, colorReplacementsNeon.blink)) {
    return (time * 10000) % 2 == 0
      ? colorReplacementsNeon.on + ";"
      : colorReplacementsNeon.off + ";";
  }

  if (colorEq(oldColor, colorReplacementsWindow.nightOnly)) {
    if (numberBetween(6, 20, time)) {
      return "rgba(0,0,0,0);";
    }
    return colorReplacementsWindow.nightLight;
  } else if (
    colorEq(oldColor, colorReplacementsWindow.nightLight) ||
    colorEq(oldColor, colorReplacementsWindow.nightRandom)
  ) {
    if (numberBetween(6, 20, time)) {
      return colorReplacementsWindow.day + ";";
    }

    if (
      (typeof opts.alwayslightup != "undefined" && opts.alwayslightup) ||
      colorEq(oldColor, colorReplacementsWindow.nightLight)
    ) {
      return colorReplacementsWindow.nightLight + ";";
    }

    var lightsChance = Math.abs(time - 12) / 24;
    return Math.random() > lightsChance
      ? colorReplacementsWindow.nightLight + ";"
      : colorReplacementsWindow.nightDark + ";";
  }

  var color = Color(oldColor);
  if (numberBetween(5, 6.1, time) || numberBetween(17, 18.1, time)) {
    color = color.darkenByRatio(0.05).blend(Color("#FF8800"), 0.1);
  } else if (numberBetween(4, 5.1, time) || numberBetween(18, 19.1, time)) {
    color = color.darkenByRatio(0.1).blend(Color("#FF4400"), 0.1);
  } else if (numberBetween(3, 4.1, time) || numberBetween(19, 20.1, time)) {
    color = color
      .darkenByRatio(0.2)
      .desaturateByRatio(0.2)
      .blend(Color("#8800FF"), 0.1);
  } else if (numberBetween(20, 24, time) || numberBetween(-1, 6.1, time)) {
    // From 9 PM until 6 AM
    color = color
      .darkenByRatio(0.2)
      .desaturateByRatio(0.5)
      .blend(Color("#0000ff"), 0.2);
  }
  return color.toCSS() + ";";
}

function recolourAll({ flip, svg, primary, secondary }) {
  var flipped = opts.flip ? "Alt" : "";
  opts.svg = recolour(opts.svg, "primary" + flipped, opts.primary);
  opts.svg = recolour(opts.svg, "secondary" + flipped, opts.secondary);

  opts.svg = opts.svg.replace(/(#[a-fA-F0-9]{6});/g, function(a, b) {
    return recolorEvening(a, b, opts.time, opts);
  });

  return opts.svg;
}

export default recolourAll;
