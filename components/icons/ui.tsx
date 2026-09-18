"use client";

import { forwardRef } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import * as H from "@hugeicons/core-free-icons";

// Hugeicons (free Stroke Rounded set) behind the same component shape the
// app used with Phosphor: <XIcon size={16} className="..." />. `weight` is
// accepted and mapped to stroke width so the "bold" action icons still read
// heavier than the pill icons; there is no fill variant in the free set, so
// active state is carried by the pill, not the glyph.

export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref" | "width" | "height" | "strokeWidth"> & {
  size?: number | string;
  weight?: IconWeight;
};
export type Icon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

const STROKE: Record<IconWeight, number> = {
  thin: 1,
  light: 1.25,
  regular: 1.5,
  duotone: 1.5,
  fill: 1.5,
  bold: 2,
};

const make = (glyph: IconSvgElement, name: string): Icon => {
  const C = forwardRef<SVGSVGElement, IconProps>(({ size = 24, weight = "regular", ...rest }, ref) => (
    <HugeiconsIcon ref={ref} icon={glyph} size={size} strokeWidth={STROKE[weight]} {...rest} />
  ));
  C.displayName = name;
  return C;
};

// Actions and chrome
export const CheckIcon = make(H.Tick02Icon, "CheckIcon");
export const XIcon = make(H.Cancel01Icon, "XIcon");
export const PlusIcon = make(H.PlusSignIcon, "PlusIcon");
export const DownloadIcon = make(H.Download01Icon, "DownloadIcon");
export const UploadSimpleIcon = make(H.Upload01Icon, "UploadSimpleIcon");
export const ShuffleIcon = make(H.ShuffleIcon, "ShuffleIcon");
export const TrashIcon = make(H.Delete02Icon, "TrashIcon");
export const GearSixIcon = make(H.Settings02Icon, "GearSixIcon");
export const CaretDownIcon = make(H.ArrowDown01Icon, "CaretDownIcon");
export const CaretUpIcon = make(H.ArrowUp01Icon, "CaretUpIcon");
export const EyedropperIcon = make(H.ColorPickerIcon, "EyedropperIcon");
export const ArrowsOutLineHorizontalIcon = make(H.ArrowHorizontalIcon, "ArrowsOutLineHorizontalIcon");

// Sections and tabs
export const StackIcon = make(H.Layers01Icon, "StackIcon");
export const SlidersIcon = make(H.SlidersHorizontalIcon, "SlidersIcon");
export const SwatchesIcon = make(H.ColorsIcon, "SwatchesIcon");
export const PaletteIcon = make(H.PaintBoardIcon, "PaletteIcon");
export const RippleIcon = make(H.Target03Icon, "RippleIcon");
export const SparkleIcon = make(H.SparklesIcon, "SparkleIcon");
export const ShapesIcon = make(H.ShapesIcon, "ShapesIcon");
export const CropIcon = make(H.CropIcon, "CropIcon");
export const TabsIcon = make(H.LayoutGridIcon, "TabsIcon");

// Styles
export const CirclesThreeIcon = make(H.BubblesIcon, "CirclesThreeIcon");
export const WaveSineIcon = make(H.WaveIcon, "WaveSineIcon");
export const CloudIcon = make(H.CloudIcon, "CloudIcon");

// Dials
export const DropIcon = make(H.DropletIcon, "DropIcon");
export const DotsNineIcon = make(H.Grid3X3Icon, "DotsNineIcon");
export const CircleHalfIcon = make(H.ContrastIcon, "CircleHalfIcon");
export const RowsIcon = make(H.RowsThreeIcon, "RowsIcon");
export const SunDimIcon = make(H.SunDimIcon, "SunDimIcon");
export const FeatherIcon = make(H.FeatherIcon, "FeatherIcon");
export const ArrowsOutSimpleIcon = make(H.ArrowExpandIcon, "ArrowsOutSimpleIcon");
export const LineSegmentIcon = make(H.SolidLine01Icon, "LineSegmentIcon");

// Effects
export const ProhibitIcon = make(H.UnavailableIcon, "ProhibitIcon");
export const GridFourIcon = make(H.Grid2X2Icon, "GridFourIcon");
export const HashIcon = make(H.HashtagIcon, "HashIcon");

// Sizes
export const MonitorIcon = make(H.ComputerIcon, "MonitorIcon");
export const LaptopIcon = make(H.LaptopIcon, "LaptopIcon");
export const DeviceMobileIcon = make(H.SmartPhone01Icon, "DeviceMobileIcon");
export const DeviceTabletCameraIcon = make(H.Tablet01Icon, "DeviceTabletCameraIcon");
export const YoutubeLogoIcon = make(H.YoutubeIcon, "YoutubeLogoIcon");
export const InstagramLogoIcon = make(H.InstagramIcon, "InstagramLogoIcon");
export const NotionLogoIcon = make(H.Notion01Icon, "NotionLogoIcon");

// Overlay shapes
export const CircleIcon = make(H.CircleIcon, "CircleIcon");
export const SquareIcon = make(H.SquareIcon, "SquareIcon");
export const SelectionIcon = make(H.SquareDashedIcon, "SelectionIcon");
export const DiamondIcon = make(H.DiamondIcon, "DiamondIcon");
export const TriangleIcon = make(H.TriangleIcon, "TriangleIcon");
export const HexagonIcon = make(H.HexagonIcon, "HexagonIcon");
export const StarIcon = make(H.StarIcon, "StarIcon");
export const FlowerIcon = make(H.FlowerIcon, "FlowerIcon");
export const SealIcon = make(H.SealIcon, "SealIcon");
export const HeartIcon = make(H.FavouriteIcon, "HeartIcon");
