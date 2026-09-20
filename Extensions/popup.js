const CANVAS_BASE = "https://canvas.vt.edu";

document.getElementById("fetch-btn").addEventListener("click", async () => {
  const statusDiv = document.getElementById("status");
  const resultBox = document.getElementById("result-box");
  const fetchBtn = document.getElementById("fetch-btn");

  statusDiv.innerText = "Fetching active courses and assignments...";
  fetchBtn.disabled = true;
  resultBox.style.display = "none";

  try {
    // 1. 현재 활성화된 수강 과목 목록 조회
    const coursesRes = await fetch(
      `${CANVAS_BASE}/api/v1/courses?enrollment_state=active&per_page=50`,
      {
        credentials: "include",
        headers: { "Accept": "application/json" }
      }
    );

    if (!coursesRes.ok) {
      throw new Error(`Failed to load courses (HTTP ${coursesRes.status}). Please log in to canvas.vt.edu first.`);
    }

    const courses = await coursesRes.json();
    const validCourses = courses.filter(c => c.name && !c.access_restricted_by_date);

    // 날짜 기준 설정: 오늘부터 딱 7일 뒤(일주일치)까지로 변경
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 7);

    let allAssignments = [];

    // 2. 각 과목별 과제 병렬 수집
    statusDiv.innerText = `Fetching tasks from ${validCourses.length} courses...`;
    
    const assignmentPromises = validCourses.map(async (course) => {
      let pageUrl = `${CANVAS_BASE}/api/v1/courses/${course.id}/assignments?per_page=100`;
      let courseAssignments = [];

      while (pageUrl) {
        const res = await fetch(pageUrl, {
          credentials: "include",
          headers: { "Accept": "application/json" }
        });
        if (!res.ok) break;
        
        const data = await res.json();
        courseAssignments = courseAssignments.concat(data);

        // 페이징 처리 (Link 헤더 확인)
        const linkHeader = res.headers.get("Link");
        pageUrl = null;
        if (linkHeader) {
          const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          if (nextMatch) {
            pageUrl = nextMatch[1];
          }
        }
      }

      return courseAssignments.map(a => ({ ...a, course_name: course.name }));
    });

    const results = await Promise.all(assignmentPromises);
    const flattened = results.flat();

    // 3. 오늘 ~ 딱 7일(일주일) 이내 마감 과제만 필터링 (마감일 없는 과제 제외)
    const upcomingAssignments = flattened.filter(a => {
      if (!a.due_at) return false;
      const dueDate = new Date(a.due_at);
      return dueDate >= now && dueDate <= future;
    });

    // 4. 마감일 오름차순 정렬
    upcomingAssignments.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));

    // 5. AI 스케줄러에 최적화된 포맷으로 매핑
    const formattedData = upcomingAssignments.map(item => ({
      id: item.id,
      title: item.name,
      course: item.course_name,
      due_at: item.due_at,
      points_possible: item.points_possible,
      html_url: item.html_url,
      description_raw: item.description || ""
    }));

    statusDiv.innerText = `Successfully fetched ${formattedData.length} tasks for the upcoming week!`;
    resultBox.style.display = "block";
    resultBox.value = JSON.stringify(formattedData, null, 2);

  } catch (error) {
    statusDiv.innerText = `Error: ${error.message}`;
    console.error(error);
  } finally {
    fetchBtn.disabled = false;
  }
});