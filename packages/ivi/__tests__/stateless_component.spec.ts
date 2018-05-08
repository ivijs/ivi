import { statelessComponent } from "ivi";
import * as h from "ivi-html";
import { startRender } from "./utils";

test(`props should be passed to render hook`, () => {
  startRender((r) => {
    const c = statelessComponent<number>(
      (props) => {
        expect(props).toBe(1337);
        return h.div().c(props);
      },
    );
    r(c(1337));
  });
});

test(`props should be passed to shouldUpdate hook`, () => {
  startRender((r) => {
    const c = statelessComponent<number>(
      (props) => h.div().c(props),
      (oldProps, newProps) => {
        expect(oldProps).toBe(1337);
        expect(newProps).toBe(1338);
        return true;
      },
    );
    r(c(1337));
    r(c(1338));
  });
});
