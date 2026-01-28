import React from "react";

export const lazyLoad = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) => {
  return React.lazy(factory) as React.LazyExoticComponent<T>;
};

export default lazyLoad;