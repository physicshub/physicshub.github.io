import TAGS from "../tags.js";

export const operationVectorsBlog = {
  id: "bb-002",
  slug: "operations-with-vectors",
  name: "Operation with vectors",
  desc: "Discover how operations with vectors work.",
  tags: [TAGS.EASY, TAGS.MATH, TAGS.VECTORS, TAGS.PHYSICS],
  theory: {
    sections: [
      {
        title: "What is a Vector?",
        blocks: [
          {
            type: "paragraph",
            text: "In a 2D space vectors are described with 3 different values, module (length), direction (angle), and orientation (sense). Given the angle and the module you can calculate the components on each axis (x,y). they can be calculated multiplying the module by the cosine and the sine of the angle. ",
          },
        ],
      },
      {
        title: "Purpose",
        blocks: [
          {
            type: "paragraph",
            text: "This section describes basic vector operations used in 2D simulations: addition, subtraction, scaling, normalization, dot product, and cross product (2D - pseudoscalar).",
          },
        ],
      },
      {
        title: "Fundamental Operations",
        blocks: [
          {
            type: "subheading",
            text: "Addition and subtraction",
          },
          {
            type: "paragraph",
            text: "During an addition or subtraction of 2 vectors, the resultant vector is given by the sum or the difference of each component. After that, the vector can be converted back to module with the pythagorean theorem and angle drawing it on a Cartesian Plane.",
          },
          {
            type: "subheading",
            text: "Parallelogram Addition",
          },
          {
            type: "paragraph",
            text: "The addition can be done without components with the parallelogram method, where two vectors originate from the same point, they can be used as two sides of a parallelogram, of which the diagonal originating from the same point of the two vectors, is the resultant vector. ",
          },
          {
            type: "subheading",
            text: "Triangle Addition (as shown in the simulation)",
          },
          {
            type: "paragraph",
            text: "In the triangle method, the second vector is drawn starting from the end of the first vector. The resultant vector is drawn from the origin of the first vector to the end of the second vector.",
          },
          {
            type: "subheading",
            text: "Parallelogram Subtraction (as shown in the simulation)",
          },
          {
            type: "paragraph",
            text: "In subtraction, using the parallelogram rule we can either add the opposite of the vector to be subtracted or use the other diagonal of the parallelogram as the resultant vector from the subtraction.",
          },
          {
            type: "subheading",
            text: "Multiplication by a Scalar",
          },
          {
            type: "paragraph",
            text: "The multiplication of a vector by a scalar is done by multiplying the module of the vector by the scalar, while the angle remains unchanged. If the scalar is negative, the angle changes by 180 degrees (the vector points in the opposite direction).",
          },
        ],
      },
    ],
  },
};
