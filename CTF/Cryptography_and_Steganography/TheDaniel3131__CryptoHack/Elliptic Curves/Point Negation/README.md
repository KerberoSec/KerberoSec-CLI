Point Negation10 pts · 2828 Solves
In the background section, we covered the basics of how we can view point addition over an elliptic curve as being an abelian group operation. In this geometric picture we allowed the coordinates on the curve to be any real number.

To apply elliptic curves in a cryptographic setting, we study elliptic curves which have coordinates in a finite field Fp.

We will still be considering elliptic curves of the form E: Y2 = X3 + a X + b , which satisfy the following conditions: a,b ∈ Fp and 4a3 + 27 b2 ≠ 0. However, we no longer think of the elliptic curve as a geometric object, but rather a set of points defined by

E(Fp) = {(x,y) : x,y ∈ Fp satisfying: y2 = x3 + a x + b} ∪ O

 Note: Everything we covered in the background still holds. The identity of the group is the point at infinity: O, and the addition law is unchanged. Given two points in E(Fp), the addition law will generate another point in E(Fp).

For all the challenges in the starter set, we will be working with the elliptic curve

E: Y2 = X3 + 497 X + 1768, p: 9739

Using the above curve, and the point P(8045,6936), find the point Q(x,y) such that P + Q = O.

 Remember, we're working in a finite field now, so you'll need to work correctly with negative numbers.