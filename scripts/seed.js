/**
 * Script para sembrar datos de prueba para la Semana 6
 * Ejecutar con el servidor en marcha: node scripts/seed.js
 */
const BASE_URL = 'http://localhost:3000';

async function seed() {
  console.log('Sembrando datos en CourseHub API...');

  // 1. Cursos (mínimo 8 cursos con títulos y niveles variados)
  const courses = [
    { title: 'NestJS Fundamentals', level: 'beginner' },
    { title: 'TypeScript Pro', level: 'intermediate' },
    { title: 'Docker Containers', level: 'beginner' },
    { title: 'PostgreSQL Mastery', level: 'advanced' },
    { title: 'Advanced NestJS Architecture', level: 'advanced' },
    { title: 'React Essentials', level: 'beginner' },
    { title: 'GraphQL APIs', level: 'intermediate' },
    { title: 'Microservices with Nest', level: 'advanced' },
    { title: 'DevOps & CI/CD', level: 'intermediate' },
  ];

  const createdCourses = [];
  for (const c of courses) {
    try {
      const res = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      const data = await res.json();
      createdCourses.push(data);
    } catch (e) {
      console.error('Error creando curso:', c.title, e.message);
    }
  }
  console.log(`✓ ${createdCourses.length} cursos listos.`);

  // 2. Estudiantes (mínimo 4 estudiantes con nombres que permitan búsqueda parcial)
  const students = [
    { name: 'Ana Gomez', email: 'ana@example.com', career: 'Software', semester: 4, age: 20, isActive: true },
    { name: 'Anabel Morales', email: 'anabel@example.com', career: 'Software', semester: 6, age: 22, isActive: true },
    { name: 'Carlos Mendez', email: 'carlos@example.com', career: 'Sistemas', semester: 5, age: 21, isActive: false },
    { name: 'Nestor Castillo', email: 'nestor@example.com', career: 'Software', semester: 3, age: 19, isActive: true },
  ];

  const createdStudents = [];
  for (const s of students) {
    try {
      const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (res.ok) {
        createdStudents.push(await res.json());
      } else {
        const allRes = await fetch(`${BASE_URL}/students`);
        const all = await allRes.json();
        const existing = all.find((item) => item.email === s.email);
        if (existing) createdStudents.push(existing);
      }
    } catch (e) {
      console.error('Error con estudiante:', s.name, e.message);
    }
  }
  console.log(`✓ ${createdStudents.length} estudiantes listos.`);

  // 3. Matrículas (al menos 6 matrículas)
  if (createdStudents.length >= 3 && createdCourses.length >= 5) {
    const enrollments = [
      { studentId: createdStudents[0].id, courseId: createdCourses[0].id },
      { studentId: createdStudents[0].id, courseId: createdCourses[1].id },
      { studentId: createdStudents[1].id, courseId: createdCourses[0].id },
      { studentId: createdStudents[1].id, courseId: createdCourses[3].id },
      { studentId: createdStudents[3].id, courseId: createdCourses[2].id },
      { studentId: createdStudents[3].id, courseId: createdCourses[4].id },
    ];

    let enCount = 0;
    for (const en of enrollments) {
      try {
        const res = await fetch(`${BASE_URL}/enrollments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(en),
        });
        if (res.ok) enCount++;
      } catch (e) {
        // Ignorar si ya existía
      }
    }
    console.log(`✓ Matrículas preparadas.`);
  }

  console.log('¡Sembrado completado exitosamente!');
}

seed();
